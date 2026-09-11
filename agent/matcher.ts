import "server-only";

import OpenAI from "openai";

import type { Profile } from "@/types";

export type JobMatch = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

type MatchableJob = {
  title: string;
  company: string;
  location: string;
  description: string;
};

function clampScore(value: unknown): number {
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
}

export async function matchJobsToProfile(
  jobs: MatchableJob[],
  profile: Profile,
): Promise<JobMatch[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API is not configured");
  }

  const openai = new OpenAI({ apiKey, timeout: 45_000 });
  if (jobs.length === 0) return [];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: Math.max(800, jobs.length * 180),
    messages: [
      {
        role: "system",
        content: "Score every job against a candidate profile. Use only facts in the inputs. Return JSON with a matches array containing one object per input job, in the same order. Each object must have matchScore (integer 0-100), matchReason (one concise paragraph), matchedSkills (string array), and missingSkills (string array). Do not invent candidate experience or job requirements.",
      },
      {
        role: "user",
        content: JSON.stringify({
          candidate: {
            currentTitle: profile.current_title,
            experienceLevel: profile.experience_level,
            yearsExperience: profile.years_experience,
            skills: profile.skills,
            industries: profile.industries,
            workExperience: profile.work_experience,
            jobTitlesSeeking: profile.job_titles_seeking,
          },
          jobs,
        }),
      },
    ],
  });

  const rawContent = response.choices[0]?.message.content;
  if (!rawContent) {
    throw new Error("OpenAI returned an empty match response");
  }

  const parsed = JSON.parse(rawContent) as { matches?: unknown };
  const matches = Array.isArray(parsed.matches) ? parsed.matches : [];

  return jobs.map((_, index) => {
    const value = matches[index];
    const match = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const matchReason = typeof match.matchReason === "string" && match.matchReason.trim()
      ? match.matchReason.trim()
      : "Profile and job requirements were compared using the available information.";

    return {
      matchScore: clampScore(match.matchScore),
      matchReason,
      matchedSkills: stringArray(match.matchedSkills),
      missingSkills: stringArray(match.missingSkills),
    };
  });
}
