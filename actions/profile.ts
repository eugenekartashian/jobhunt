"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { createServerClient } from "@insforge/sdk/ssr";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

import { requireUserAuthenticated } from "@/lib/insforge-auth";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import { calculateCompletion } from "@/lib/profile-utils";
import type {
  CoverLetterTone,
  Education,
  ExperienceLevel,
  Profile,
  ExtractedProfile,
  RemotePreference,
  WorkAuthorization,
  WorkExperience,
} from "@/types";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const resumePath = (userId: string, filename = "resume.pdf") => {
  const safeFilename = filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "") || "resume.pdf";
  return `${userId}/${safeFilename.toLowerCase().endsWith(".pdf") ? safeFilename : `${safeFilename}.pdf`}`;
};

export type ProfileSaveResult = {
  success: boolean;
  message: string;
  profile: Profile | null;
};

export type ResumeUploadResult = {
  success: boolean;
  message: string;
  url: string | null;
  key: string | null;
};

export type ProfileExtractionResult = {
  success: boolean;
  message: string;
  profile: ExtractedProfile | null;
};

const allowedValues = {
  experience_level: new Set<ExperienceLevel>(["junior", "mid", "senior", "lead"]),
  remote_preference: new Set<RemotePreference>(["remote", "onsite", "hybrid", "any"]),
  cover_letter_tone: new Set<CoverLetterTone>(["formal", "casual", "enthusiastic"]),
  work_authorization: new Set<WorkAuthorization>(["citizen", "permanent_resident", "visa_required"]),
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function asStringArray(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(/\n|[•▪]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => typeof item === "string"
      ? item
      : item && typeof item === "object"
        ? firstText(item as Record<string, unknown>, "text", "description", "bullet", "content", "responsibility", "duty", "achievement")
        : null)
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstValue(record: Record<string, unknown>, ...keys: string[]): unknown {
  return keys.map((key) => record[key]).find((value) => value !== undefined && value !== null);
}

function firstText(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = asNullableString(record[key]);
    if (value) {
      return value;
    }
  }
  return null;
}

function normalizeMonth(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const input = value.trim();
  if (/^\d{4}-\d{2}$/.test(input)) {
    return input;
  }

  const numericMonth = input.match(/^(\d{1,2})[\/-](\d{4})$/);
  if (numericMonth) {
    return `${numericMonth[2]}-${numericMonth[1].padStart(2, "0")}`;
  }

  const namedMonth = input.match(/^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})$/i);
  if (namedMonth) {
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
      .indexOf(namedMonth[1].slice(0, 3).toLowerCase()) + 1;
    return `${namedMonth[2]}-${String(month).padStart(2, "0")}`;
  }

  const year = input.match(/^(\d{4})$/);
  return year ? `${year[1]}-01` : undefined;
}

function normalizeDegree(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const degree = value.toLowerCase().replace(/[.'’]/g, "").trim();
  if (degree.includes("high school") || degree.includes("secondary")) return "high_school";
  if (degree.includes("associate") || degree === "aa" || degree === "as") return "associate";
  if (degree.includes("bachelor") || degree === "ba" || degree === "bs" || degree === "bsc") return "bachelor";
  if (degree.includes("master") || degree === "ma" || degree === "ms" || degree === "msc") return "master";
  if (degree.includes("doctor") || degree.includes("phd") || degree.includes("doctoral")) return "doctorate";
  return undefined;
}

function normalizeExperience(value: unknown): WorkExperience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const experience = item as Record<string, unknown>;
    const endDate = firstText(experience, "endDate", "end_date");
    const responsibilities = [
      ...asStringArray(experience.responsibilities),
      ...asStringArray(experience.key_responsibilities),
      ...asStringArray(experience.keyResponsibilities),
      ...asStringArray(experience.bullets),
      ...asStringArray(experience.duties),
      ...asStringArray(experience.achievements),
      ...asStringArray(experience.description),
      ...asStringArray(experience.details),
    ];
    return {
      companyName: firstText(experience, "companyName", "company_name", "company") ?? undefined,
      jobTitle: firstText(experience, "jobTitle", "job_title", "title") ?? undefined,
      startDate: normalizeMonth(firstValue(experience, "startDate", "start_date")),
      endDate: normalizeMonth(endDate),
      isCurrent: firstValue(experience, "isCurrent", "is_current") === true || Boolean(endDate && /present|current|now/i.test(endDate)),
      responsibilities: [...new Set(responsibilities)],
    };
  });
}

function normalizeEducation(value: unknown): Education {
  const education = (value ?? {}) as Record<string, unknown>;
  return {
    degree: normalizeDegree(education.degree),
    field: asNullableString(education.field) ?? undefined,
    institution: asNullableString(education.institution) ?? undefined,
    graduationYear: asNullableString(education.graduationYear) ?? undefined,
  };
}

function hasWorkExperience(value: WorkExperience[]): boolean {
  return value.some((experience) => Boolean(
    experience.companyName ||
    experience.jobTitle ||
    experience.startDate ||
    experience.responsibilities?.some(Boolean),
  ));
}

function parseProfile(value: FormDataEntryValue | null): Record<string, unknown> | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function validationError(message: string): ProfileSaveResult {
  return { success: false, message, profile: null };
}

function extractedString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function extractedStringArray(value: unknown): string[] | undefined {
  const values = asStringArray(value);
  return values.length > 0 ? values : undefined;
}

function parseExtractedProfile(value: unknown): ExtractedProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const input = value as Record<string, unknown>;
  const experienceLevel = input.experience_level;
  const validExperienceLevel = ["junior", "mid", "senior", "lead"].includes(String(experienceLevel))
    ? experienceLevel as ExperienceLevel
    : undefined;
  const yearsExperience = typeof input.years_experience === "number" && Number.isFinite(input.years_experience)
    ? input.years_experience
    : undefined;

  return {
    full_name: extractedString(input.full_name),
    phone: extractedString(input.phone),
    location: extractedString(input.location),
    current_title: extractedString(input.current_title),
    experience_level: validExperienceLevel,
    years_experience: yearsExperience,
    skills: extractedStringArray(input.skills),
    industries: extractedStringArray(input.industries),
    work_experience: Array.isArray(input.work_experience) ? normalizeExperience(input.work_experience) : undefined,
    education: input.education && typeof input.education === "object" ? normalizeEducation(input.education) : undefined,
    job_titles_seeking: extractedStringArray(input.job_titles_seeking),
    remote_preference: extractedStringArray(input.remote_preference)
      ?.filter((value): value is RemotePreference => allowedValues.remote_preference.has(value as RemotePreference)),
    preferred_locations: extractedStringArray(input.preferred_locations),
    linkedin_url: extractedString(input.linkedin_url),
    portfolio_url: extractedString(input.portfolio_url),
  };
}

async function extractProfileUnsafe(): Promise<ProfileExtractionResult> {
  const user = await requireUserAuthenticated();
  const client = createServerClient({ cookies: await cookies() });
  const { data: profile, error: profileError } = await client.database
    .from("profiles")
    .select("resume_pdf_key")
    .eq("id", user.id)
    .maybeSingle();

  const resumeKey = profile?.resume_pdf_key as string | null | undefined;
  if (profileError || !resumeKey) {
    return { success: false, message: "Upload a resume before extracting your profile.", profile: null };
  }

  const { data: file, error: downloadError } = await client.storage.from("resumes").download(resumeKey);
  if (downloadError || !file) {
    console.error("[profile/extract] resume download failed", downloadError);
    return { success: false, message: "We could not read your saved resume. Please upload it again.", profile: null };
  }

  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });
  let extractedText = "";
  try {
    const result = await parser.getText();
    extractedText = result.text.trim();
  } finally {
    await parser.destroy();
  }

  if (extractedText.length < 40) {
    return { success: false, message: "Could not extract text from this PDF. Please try a different file.", profile: null };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, message: "AI extraction is not configured yet.", profile: null };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 3000,
    messages: [
      {
        role: "system",
        content: "You extract structured job seeker profile data from resumes. Return only valid JSON. Never invent values; omit fields that are not present.",
      },
      {
        role: "user",
        content: `Extract these fields from the resume: full_name, phone, location, current_title, experience_level (junior, mid, senior, or lead), years_experience (number), skills (string array), industries (string array), work_experience (array with every position found; each item MUST include responsibilities as an array of concise strings copied or faithfully summarized from that role, plus companyName, jobTitle, startDate, endDate, isCurrent; use startDate and endDate in YYYY-MM format, use isCurrent true for present roles), education (degree must be one of high_school, associate, bachelor, master, doctorate; also include field, institution, graduationYear), job_titles_seeking (string array), remote_preference (array using remote, onsite, hybrid, any), preferred_locations (string array), linkedin_url, portfolio_url. Use the exact camelCase keys companyName, jobTitle, startDate, endDate, isCurrent, responsibilities. Do not limit work experience to three positions.\n\nResume text:\n${extractedText}`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    return { success: false, message: "The AI did not return profile data. Please try again.", profile: null };
  }

  try {
    const extractedProfile = parseExtractedProfile(JSON.parse(content));
    if (!extractedProfile) {
      return { success: false, message: "The AI returned an invalid profile. Please try again.", profile: null };
    }
    return { success: true, message: "Profile extracted successfully.", profile: extractedProfile };
  } catch (error) {
    console.error("[profile/extract] invalid AI response", error);
    return { success: false, message: "The AI returned an invalid profile. Please try again.", profile: null };
  }
}

export async function extractProfile(): Promise<ProfileExtractionResult> {
  try {
    return await extractProfileUnsafe();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/profile/extractProfile]", error);
    return { success: false, message: "We could not extract your profile. Please try again.", profile: null };
  }
}

async function uploadResumeUnsafe(formData: FormData): Promise<ResumeUploadResult> {
  const user = await requireUserAuthenticated();
  const resume = formData.get("resume");

  if (!(resume instanceof File) || resume.type !== "application/pdf") {
    return { success: false, message: "Please select a PDF resume.", url: null, key: null };
  }
  if (resume.size > MAX_RESUME_SIZE) {
    return { success: false, message: "Your resume must be smaller than 5 MB.", url: null, key: null };
  }

  const client = createServerClient({ cookies: await cookies() });
  const { data: existingProfile } = await client.database
    .from("profiles")
    .select("resume_pdf_key")
    .eq("id", user.id)
    .maybeSingle();
  const previousResumeKey = existingProfile?.resume_pdf_key as string | null | undefined;
  const key = resumePath(user.id, resume.name);
  if (previousResumeKey === key) {
    await client.storage.from("resumes").remove(key);
  }
  const { data, error } = await client.storage.from("resumes").upload(key, resume);
  if (error || !data) {
    console.error("[profile/upload-resume] upload failed", error);
    return { success: false, message: "We could not upload your resume. Please try again.", url: null, key: null };
  }

  const { error: profileError } = await client.database
    .from("profiles")
    .upsert(
      {
        id: user.id,
        resume_pdf_url: data.url,
        resume_pdf_key: data.key,
      },
      { onConflict: "id" },
    );

  if (profileError) {
    console.error("[profile/upload-resume] profile reference update failed", profileError);
    return { success: false, message: "The resume uploaded, but we could not save its profile reference. Please try again.", url: null, key: null };
  }

  if (previousResumeKey && previousResumeKey !== data.key) {
    const { error: removeError } = await client.storage.from("resumes").remove(previousResumeKey);
    if (removeError) {
      console.warn("[profile/upload-resume] previous resume cleanup failed", removeError);
    }
  }

  await capturePostHogServerEvent({
    distinctId: user.id,
    event: "resume_uploaded",
    properties: { fileType: "pdf", fileSize: resume.size },
  });
  revalidatePath("/profile");

  return { success: true, message: "Resume uploaded.", url: data.url, key: data.key };
}

export async function uploadResume(formData: FormData): Promise<ResumeUploadResult> {
  try {
    return await uploadResumeUnsafe(formData);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/profile/uploadResume]", error);
    return { success: false, message: "We could not upload your resume. Please try again.", url: null, key: null };
  }
}

async function saveProfileUnsafe(formData: FormData): Promise<ProfileSaveResult> {
  const user = await requireUserAuthenticated();
  const input = parseProfile(formData.get("profile"));

  if (!input) {
    return validationError("We could not read your profile. Please try again.");
  }

  const fullName = asNullableString(input.full_name);
  const phone = asNullableString(input.phone);
  const location = asNullableString(input.location);
  const currentTitle = asNullableString(input.current_title);
  const experienceLevel = input.experience_level as ExperienceLevel;
  const yearsValue = input.years_experience;
  const yearsExperience = typeof yearsValue === "number"
    ? yearsValue
    : typeof yearsValue === "string" && yearsValue.trim() !== ""
      ? Number(yearsValue)
      : Number.NaN;
  const skills = asStringArray(input.skills);
  const workExperience = normalizeExperience(input.work_experience);
  const education = normalizeEducation(input.education);
  const jobTitlesSeeking = asStringArray(input.job_titles_seeking);
  const remotePreference = asStringArray(input.remote_preference)
    .filter((value): value is RemotePreference => allowedValues.remote_preference.has(value as RemotePreference));

  if (!fullName || !phone || !location || !currentTitle || !allowedValues.experience_level.has(experienceLevel)) {
    return validationError("Please complete your name, phone, location, job title, and experience level.");
  }
  if (!Number.isFinite(yearsExperience) || yearsExperience < 0 || yearsExperience > 80) {
    return validationError("Please enter a valid number of years of experience.");
  }
  if (skills.length === 0 || !hasWorkExperience(workExperience) || !education.institution) {
    return validationError("Please add at least one skill, one work experience entry, and your education.");
  }

  const resumeEntry = formData.get("resume");
  if (resumeEntry instanceof File) {
    if (resumeEntry.type !== "application/pdf") {
      return validationError("Please select a PDF resume.");
    }
    if (resumeEntry.size > MAX_RESUME_SIZE) {
      return validationError("Your resume must be smaller than 5 MB.");
    }
  }

  const client = createServerClient({ cookies: await cookies() });
  const { data: existingProfile } = await client.database
    .from("profiles")
    .select("resume_pdf_url, resume_pdf_key")
    .eq("id", user.id)
    .maybeSingle();

  let resumeUrl = (existingProfile?.resume_pdf_url as string | null | undefined) ?? null;
  let resumeKey = (existingProfile?.resume_pdf_key as string | null | undefined) ?? null;

  if (resumeEntry instanceof File) {
    const previousResumeKey = resumeKey;
    const key = resumePath(user.id, resumeEntry.name);
    if (previousResumeKey === key) {
      await client.storage.from("resumes").remove(key);
    }
    const { data, error } = await client.storage.from("resumes").upload(key, resumeEntry);
    if (error || !data) {
      console.error("[profile/save] resume upload failed", error);
      return validationError("We could not upload your resume. Please try again.");
    }
    resumeUrl = data.url;
    resumeKey = data.key;

    if (previousResumeKey && previousResumeKey !== data.key) {
      const { error: removeError } = await client.storage.from("resumes").remove(previousResumeKey);
      if (removeError) {
        console.warn("[profile/save] previous resume cleanup failed", removeError);
      }
    }
  }

  const profilePayload = {
    id: user.id,
    full_name: fullName,
    email: user.email ?? asNullableString(input.email),
    phone,
    location,
    current_title: currentTitle,
    experience_level: experienceLevel,
    years_experience: yearsExperience,
    skills,
    industries: asStringArray(input.industries),
    work_experience: workExperience,
    education,
    job_titles_seeking: jobTitlesSeeking,
    remote_preference: remotePreference.length > 0 ? remotePreference : null,
    preferred_locations: asStringArray(input.preferred_locations),
    salary_expectation: asNullableString(input.salary_expectation),
    cover_letter_tone: allowedValues.cover_letter_tone.has(input.cover_letter_tone as CoverLetterTone) ? input.cover_letter_tone : null,
    linkedin_url: asNullableString(input.linkedin_url),
    portfolio_url: asNullableString(input.portfolio_url),
    work_authorization: allowedValues.work_authorization.has(input.work_authorization as WorkAuthorization) ? input.work_authorization : null,
    resume_pdf_url: resumeUrl,
    resume_pdf_key: resumeKey,
    is_complete: Boolean(fullName && phone && location && currentTitle && experienceLevel && yearsExperience >= 0 && skills.length && hasWorkExperience(workExperience) && education.institution),
  };

  const { data, error } = await client.database
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select()
    .single();

  if (error || !data) {
    console.error("[profile/save] profile upsert failed", error);
    return validationError("We could not save your profile. Please try again.");
  }

  revalidatePath("/profile");
  await capturePostHogServerEvent({
    distinctId: user.id,
    event: "profile_saved",
    properties: { completion: calculateCompletion(data as Profile) },
  });
  return { success: true, message: "Profile saved successfully.", profile: data as Profile };
}

export async function saveProfile(formData: FormData): Promise<ProfileSaveResult> {
  try {
    return await saveProfileUnsafe(formData);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/profile/saveProfile]", error);
    return validationError("We could not save your profile. Please try again.");
  }
}
