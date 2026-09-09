import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  createAuthActions,
  createServerClient,
} from "@insforge/sdk/ssr";

import { getSiteOrigin, hasInsForgeEnv } from "@/lib/insforge-auth";
import { capturePostHogServerEvent } from "@/lib/posthog-server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(
    new URL("/login", getSiteOrigin(request)),
    { status: 303 },
  );

  try {
    if (!hasInsForgeEnv()) {
      clearAuthCookies(response.cookies);
      return response;
    }

    const client = createServerClient({ cookies: request.cookies });
    const { data } = await client.auth.getCurrentUser();

    if (data.user) {
      await capturePostHogServerEvent({
        distinctId: data.user.id,
        event: "auth_signed_out",
      });
    }

    const auth = createAuthActions({
      requestCookies: request.cookies,
      responseCookies: response.cookies,
    });

    await auth.signOut();

    return response;
  } catch (error) {
    console.error("[auth/sign-out]", error);
    clearAuthCookies(response.cookies);
    return response;
  }
}
