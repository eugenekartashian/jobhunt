import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";

import { getAuthenticatedUser } from "@/lib/insforge-auth";

export async function GET(): Promise<Response> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const client = createServerClient({ cookies: await cookies() });
    const { data: profile, error: profileError } = await client.database
      .from("profiles")
      .select("resume_pdf_key, resume_pdf_url")
      .eq("id", user.id)
      .maybeSingle();

    const storedKey = profile?.resume_pdf_key as string | null | undefined;
    const storedUrl = profile?.resume_pdf_url as string | null | undefined;
    const keyFromUrl = storedUrl
      ? decodeURIComponent(new URL(storedUrl).pathname.split("/objects/")[1] ?? "")
      : "";
    const resumeKey = storedKey || keyFromUrl;

    if (profileError || !resumeKey || !resumeKey.startsWith(`${user.id}/`)) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
    }

    const { data: file, error: downloadError } = await client.storage
      .from("resumes")
      .download(resumeKey);

    if (downloadError || !file) {
      console.error("[api/resume] download failed", downloadError);
      return NextResponse.json({ success: false, error: "Resume could not be loaded" }, { status: 404 });
    }

    const filename = (resumeKey.split("/").pop() ?? "resume.pdf").replace(/[^a-zA-Z0-9._-]/g, "-");
    return new Response(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[api/resume] unexpected error", error);
    return NextResponse.json({ success: false, error: "Resume could not be loaded" }, { status: 500 });
  }
}
