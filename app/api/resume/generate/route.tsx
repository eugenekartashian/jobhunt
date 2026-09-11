import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createElement } from "react";
import type { ReactElement } from "react";
import OpenAI from "openai";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { createServerClient } from "@insforge/sdk/ssr";

import { ResumePDF, type GeneratedResumeContent } from "@/app/api/resume/generate/ResumePDF";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import { getAuthenticatedUser } from "@/lib/insforge-auth";
import type { Profile } from "@/types";

const generatedResumeKey = (userId: string) => `${userId}/generated-resume.pdf`;

function fallbackContent(profile: Profile): GeneratedResumeContent {
  return {
    summary: `${profile.current_title ?? "Professional"} with ${profile.years_experience ?? 0} years of experience in ${profile.skills.slice(0, 4).join(", ")}.`,
    experience: profile.work_experience.map((role) => ({
      companyName: role.companyName ?? "",
      jobTitle: role.jobTitle ?? "",
      startDate: role.startDate ?? "",
      endDate: role.isCurrent ? "Present" : role.endDate ?? "",
      responsibilities: role.responsibilities?.filter(Boolean) ?? [],
    })),
  };
}

function parseGeneratedContent(value: unknown, profile: Profile): GeneratedResumeContent {
  const fallback = fallbackContent(profile);
  if (!value || typeof value !== "object") return fallback;
  const input = value as Record<string, unknown>;
  return {
    summary: typeof input.summary === "string" && input.summary.trim() ? input.summary.trim() : fallback.summary,
    experience: fallback.experience,
  };
}

export async function POST(): Promise<Response> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: "Resume generation is not configured" }, { status: 503 });
    }

    const client = createServerClient({ cookies: await cookies() });
    const { data, error: profileError } = await client.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !data) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const profile = data as Profile;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60_000 });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: "Write a concise, polished, truthful resume summary in neutral professional resume style. Do not use the person's name, first-person language, or third-person pronouns such as he, she, or they. Use clear descriptive phrases such as 'Senior Full Stack Engineer with 5+ years of experience...' and state what the candidate does, their main technologies, domain experience, and target roles. Never invent employers, dates, skills, achievements, or responsibilities. Return only JSON with a summary string.",
        },
        {
          role: "user",
          content: `Create a neutral resume summary from this profile. Return {summary: string}. Use only facts present in the profile. Do not mention the candidate by name or use pronouns. Focus on what the candidate does and the technologies, domains, and roles supported by the profile. Profile: ${JSON.stringify(profile)}`,
        },
      ],
    });

    const rawContent = response.choices[0]?.message.content;
    let content = fallbackContent(profile);
    if (rawContent) {
      try {
        content = parseGeneratedContent(JSON.parse(rawContent), profile);
      } catch (error) {
        console.warn("[resume/generate] invalid AI summary; using profile fallback", error);
      }
    }
    const pdfDocument = createElement(ResumePDF, { profile, content });
    // The renderer type accepts Document elements while the named wrapper returns a typed React element.
    const pdfBuffer = await renderToBuffer(pdfDocument as unknown as ReactElement<DocumentProps>);
    const key = generatedResumeKey(user.id);
    const previousKey = profile.resume_pdf_key;
    if (previousKey === key) {
      await client.storage.from("resumes").remove(key);
    }
    const { data: upload, error: uploadError } = await client.storage
      .from("resumes")
      .upload(key, new Blob([pdfBuffer as unknown as ArrayBuffer], { type: "application/pdf" }));

    if (uploadError || !upload) {
      console.error("[resume/generate] upload failed", uploadError);
      return NextResponse.json({ success: false, error: "Generated resume could not be saved" }, { status: 500 });
    }

    const { error: updateError } = await client.database
      .from("profiles")
      .update({ resume_pdf_url: upload.url, resume_pdf_key: upload.key })
      .eq("id", user.id);

    if (updateError) {
      console.error("[resume/generate] profile update failed", updateError);
      return NextResponse.json({ success: false, error: "Generated resume reference could not be saved" }, { status: 500 });
    }

    if (previousKey && previousKey !== key) {
      await client.storage.from("resumes").remove(previousKey);
    }
    await capturePostHogServerEvent({ distinctId: user.id, event: "resume_generated", properties: { fileType: "pdf" } });
    return NextResponse.json({ success: true, data: { key: upload.key } });
  } catch (error) {
    console.error("[resume/generate] unexpected error", error);
    return NextResponse.json({ success: false, error: "Resume generation failed" }, { status: 500 });
  }
}
