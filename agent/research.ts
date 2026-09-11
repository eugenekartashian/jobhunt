import "server-only";

import { browserbase, Stagehand, type StagehandBrowser } from "@browserbasehq/stagehand";
import Browserbase from "@browserbasehq/sdk";
import OpenAI from "openai";
import { z } from "zod";

import type { CompanyResearch, Job, Profile } from "@/types";

const homepageSchema = z.object({
  oneLiner: z.string(),
  productSummary: z.string(),
  signals: z.array(z.string()),
  pageLinks: z.array(z.object({
    url: z.string(),
    kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"]),
  })),
});

const subpageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z.array(z.string()),
  valuesOrCulture: z.array(z.string()),
  notable: z.array(z.string()),
});

const stringListSchema = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  const text = value.trim();
  if (!text) return [];
  try {
    const parsed: unknown = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [text];
  } catch {
    return [text];
  }
}, z.array(z.string()));

const dossierSchema = z.object({
  companyOverview: z.string(),
  techStack: stringListSchema,
  culture: stringListSchema,
  whyThisRole: z.string(),
  yourEdge: stringListSchema,
  gapsToAddress: stringListSchema,
  smartQuestions: stringListSchema,
  interviewPrep: stringListSchema,
  sources: stringListSchema,
});

type WebsiteResearch = {
  homepage: string;
  oneLiner: string;
  productSummary: string;
  signals: string[];
  pages: Array<z.infer<typeof subpageSchema> & { url: string }>;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function unique(values: string[]): string[] {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function rootDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/u.test(parsed.protocol) || /adzuna\.com$/iu.test(parsed.hostname)) return null;
    const parts = parsed.hostname.split(".").filter(Boolean);
    return parts.length >= 2 ? parts.slice(-2).join(".") : null;
  } catch {
    return null;
  }
}

async function resolveHomepage(job: Job): Promise<string> {
  const candidate = job.external_apply_url ?? job.source_url;
  const browserbaseApiKey = process.env.BROWSERBASE_API_KEY;
  if (browserbaseApiKey) {
    try {
      const client = new Browserbase({ apiKey: browserbaseApiKey, timeout: 15_000, maxRetries: 0 });
      const fetched = await client.fetchAPI.create({ url: candidate, allowRedirects: true, format: "raw" });
      const fetchedUrl = fetched.headers["x-final-url"] ?? fetched.headers["x-browserbase-final-url"] ?? fetched.headers.location;
      const resolved = fetchedUrl ? rootDomain(fetchedUrl) : null;
      if (resolved) return `https://${resolved}`;
    } catch (error) {
      console.warn("[agent/research] Browserbase Fetch failed", error);
    }
  }

  try {
    const response = await fetch(candidate, { redirect: "follow", signal: AbortSignal.timeout(10_000) });
    const resolved = rootDomain(response.url);
    if (resolved) return `https://${resolved}`;
  } catch (error) {
    console.warn("[agent/research] redirect resolution failed", error);
  }

  const slug = job.company.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
  return `https://www.${slug}.com`;
}

function preferredLinks(homepage: string, links: Array<{ url: string; kind: string }>): string[] {
  const base = new URL(homepage);
  const priority = ["about", "engineering", "product", "blog", "team", "careers", "other"];
  return links
    .filter((link) => {
      try {
        const url = new URL(link.url, homepage);
        return url.protocol === "https:" && url.hostname === base.hostname;
      } catch {
        return false;
      }
    })
    .sort((a, b) => priority.indexOf(a.kind) - priority.indexOf(b.kind))
    .map((link) => new URL(link.url, homepage).toString())
    .filter((url, index, all) => all.indexOf(url) === index)
    .slice(0, 3);
}

async function collectWebsiteResearch(homepage: string): Promise<WebsiteResearch | null> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !projectId || !openAiKey) return null;

  let stagehand: Stagehand | null = null;
  let browser: StagehandBrowser | null = null;
  try {
    browser = await browserbase.launch({ apiKey, projectId });
    stagehand = await Stagehand.create({
      browser,
      model: { modelName: "openai/gpt-4o", apiKey: openAiKey },
      logging: { level: "error" },
    });
    const page = await stagehand.browser.context.newPage(homepage);
    const homepageResult = await stagehand.extract(
      "This is a company's homepage. Capture what the company actually does, who it is for, concrete signals, and internal links worth visiting to research them as an employer.",
      homepageSchema as never,
      { page, timeout: 45_000 },
    );
    const data = homepageSchema.parse(homepageResult.data);
    if (!clean(data.oneLiner) && !clean(data.productSummary)) return null;

    const pages: WebsiteResearch["pages"] = [];
    for (const url of preferredLinks(homepage, data.pageLinks)) {
      try {
        await page.goto(url, { timeout: 30_000, waitUntil: "domcontentloaded" });
        const result = await stagehand.extract(
          "Extract substance that helps a candidate understand this company before applying: values, working style, technologies, projects, customers, and how the team operates. Ignore navigation, footers, cookie banners, and generic marketing copy.",
          subpageSchema as never,
          { page, timeout: 35_000 },
        );
        pages.push({ ...subpageSchema.parse(result.data), url });
      } catch (error) {
        console.warn("[agent/research] subpage extraction failed", error);
      }
    }

    return { homepage, oneLiner: clean(data.oneLiner), productSummary: clean(data.productSummary), signals: unique(data.signals), pages };
  } catch (error) {
    console.warn("[agent/research] browser research failed", error);
    return null;
  } finally {
    if (stagehand) {
      try { await stagehand.close(); } catch (error) { console.warn("[agent/research] browser close failed", error); }
    } else if (browser) {
      try { await browser.close(); } catch (error) { console.warn("[agent/research] browser close failed", error); }
    }
  }
}

export async function synthesizeCompanyResearch(job: Job, profile: Profile): Promise<CompanyResearch> {
  const website = await collectWebsiteResearch(await resolveHomepage(job));
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API is not configured");

  const openai = new OpenAI({ apiKey, timeout: 60_000 });
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 1200,
    messages: [
      {
        role: "system",
        content: "You are a sharp career strategist preparing a candidate for a specific role. Use only facts in the supplied research, job posting, and profile. Never invent company facts. If website research is missing, say the company overview is based on the job posting. Be specific to this candidate. Reframe missing skills as an honest gap strategy. Every item must be concise, concrete, and useful in an interview. Return only valid JSON matching the requested 9-field dossier. Write in neutral professional language, never in third person and never using the candidate's name.",
      },
      {
        role: "user",
        content: JSON.stringify({
          companyResearch: website,
          job: { title: job.title, company: job.company, description: job.about_role, matchedSkills: job.matched_skills, missingSkills: job.missing_skills },
          candidate: { currentTitle: profile.current_title, yearsExperience: profile.years_experience, experienceLevel: profile.experience_level, skills: profile.skills, workExperience: profile.work_experience },
          outputShape: { companyOverview: "string", techStack: ["string"], culture: ["string"], whyThisRole: "string", yourEdge: ["string"], gapsToAddress: ["string"], smartQuestions: ["string"], interviewPrep: ["string"], sources: ["url string"] },
        }),
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error("OpenAI returned an empty research response");
  return dossierSchema.parse(JSON.parse(content));
}
