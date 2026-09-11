import { NextRequest, NextResponse } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

import {
  getSiteOrigin,
  hasInsForgeEnv,
  OAUTH_PKCE_COOKIE,
} from "@/lib/insforge-auth";
import { capturePostHogServerEvent } from "@/lib/posthog-server";

function redirectWithError(request: NextRequest, error: string): NextResponse {
  const url = new URL("/login", getSiteOrigin(request));
  url.searchParams.set("error", error);

  const response = NextResponse.redirect(url);
  response.cookies.delete(OAUTH_PKCE_COOKIE);

  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!hasInsForgeEnv()) {
      return redirectWithError(request, "config_missing");
    }

    const url = new URL(request.url);

    if (url.searchParams.get("insforge_status") === "error") {
      return redirectWithError(request, "oauth_cancelled");
    }

    const code = url.searchParams.get("insforge_code");
    const codeVerifier = request.cookies.get(OAUTH_PKCE_COOKIE)?.value;

    if (!code) {
      return redirectWithError(request, "missing_code");
    }

    if (!codeVerifier) {
      return redirectWithError(request, "missing_verifier");
    }

    const response = NextResponse.redirect(
      new URL("/profile", getSiteOrigin(request)),
    );
    const auth = createAuthActions({
      requestCookies: request.cookies,
      responseCookies: response.cookies,
    });
    const { data, error } = await auth.exchangeOAuthCode(
      code,
      codeVerifier,
    );

    response.cookies.delete(OAUTH_PKCE_COOKIE);

    if (error) {
      console.error("[auth/callback]", error);
      return redirectWithError(request, "oauth_exchange_failed");
    }

    if (data?.user) {
      await capturePostHogServerEvent({
        distinctId: data.user.id,
        event: "auth_signed_in",
        properties: { method: "oauth" },
      });
    }

    return response;
  } catch (error) {
    console.error("[auth/callback]", error);
    return redirectWithError(request, "oauth_exchange_failed");
  }
}
