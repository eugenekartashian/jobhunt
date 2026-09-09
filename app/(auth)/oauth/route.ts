import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

import {
  getSiteOrigin,
  hasInsForgeEnv,
  OAUTH_PKCE_COOKIE,
} from "@/lib/insforge-auth";

const providers = new Set(["google", "github"]);

const oauthCookieOptions = {
  httpOnly: true,
  maxAge: 10 * 60,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;

function loginRedirect(request: Request, error: string): NextResponse {
  const url = new URL("/login", getSiteOrigin(request));
  url.searchParams.set("error", error);

  return NextResponse.redirect(url);
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    if (!hasInsForgeEnv()) {
      return loginRedirect(request, "config_missing");
    }

    const url = new URL(request.url);
    const provider = url.searchParams.get("provider")?.toLowerCase();

    if (!provider || !providers.has(provider)) {
      return loginRedirect(request, "invalid_provider");
    }

    const cookieStore = await cookies();
    const auth = createAuthActions({ cookies: cookieStore });
    const callbackUrl = new URL("/callback", getSiteOrigin(request)).toString();
    const { data, error } = await auth.signInWithOAuth(provider, {
      redirectTo: callbackUrl,
      skipBrowserRedirect: true,
      additionalParams:
        provider === "google" ? { prompt: "select_account" } : undefined,
    });

    if (error || !data?.url || !data.codeVerifier) {
      console.error("[auth/oauth]", error);
      return loginRedirect(request, "oauth_start_failed");
    }

    const response = NextResponse.redirect(data.url);
    response.cookies.set(
      OAUTH_PKCE_COOKIE,
      data.codeVerifier,
      oauthCookieOptions,
    );

    return response;
  } catch (error) {
    console.error("[auth/oauth]", error);
    return loginRedirect(request, "oauth_start_failed");
  }
}
