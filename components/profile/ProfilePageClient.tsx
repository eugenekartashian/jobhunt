"use client";

import type { ChangeEvent, DragEvent, FormEvent, ReactElement, ReactNode } from "react";
import { useRef, useState } from "react";
import { Check } from "lucide-react";

import { extractProfile, saveProfile, uploadResume } from "@/actions/profile";
import { PostHogIdentify } from "@/components/analytics/PostHogIdentify";
import { ProfileAttentionBanner } from "@/components/profile/ProfileAttentionBanner";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ResumeSection } from "@/components/profile/ResumeSection";
import { calculateCompletion, getMissingFields } from "@/lib/profile-utils";
import type { Education, ExtractedProfile, Profile, WorkExperience } from "@/types";

type ProfilePageClientProps = {
  userEmail: string;
  userId: string;
  initialProfile: Profile | null;
};

type SaveState = "idle" | "saving" | "saved";
type ResumeState = "empty" | "selected" | "invalid";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const blankWorkExperience = (): WorkExperience => ({
  companyName: "",
  jobTitle: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  responsibilities: [""],
});

const createEmptyProfile = (email: string, id: string): Profile => ({
  id,
  full_name: null,
  email,
  phone: "",
  location: "",
  current_title: null,
  experience_level: null,
  years_experience: null,
  skills: [],
  industries: [],
  work_experience: [blankWorkExperience()],
  education: {},
  job_titles_seeking: [],
  remote_preference: ["any"],
  preferred_locations: [],
  salary_expectation: "",
  cover_letter_tone: null,
  linkedin_url: "",
  portfolio_url: null,
  work_authorization: null,
  resume_pdf_url: null,
  resume_pdf_key: null,
  is_complete: false,
  created_at: "",
  updated_at: "",
});

const inputClassName =
  "focus-ring min-h-11 w-full cursor-text rounded-md border border-border bg-surface px-3 text-sm text-text-primary shadow-card placeholder:text-text-muted disabled:cursor-not-allowed";
const selectClassName = `${inputClassName} cursor-pointer appearance-none pr-10`;
const labelClassName = "text-[10px] font-bold uppercase tracking-[0.08em] text-text-slate-medium";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}): ReactElement {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className={labelClassName}>{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section className="border-t border-border pt-7 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-bold text-text-primary">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TagList({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (item: string) => void;
}): ReactElement {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Added items">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex min-h-8 items-center gap-2 rounded-md bg-surface-muted px-3 text-xs font-semibold text-text-dark"
        >
          {item}
          <button
            type="button"
            className="focus-ring cursor-pointer rounded text-text-muted hover:text-text-primary"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item}`}
          >
            x
          </button>
        </span>
      ))}
    </div>
  );
}

export function ProfilePageClient({
  userEmail,
  userId,
  initialProfile,
}: ProfilePageClientProps): ReactElement {
  const [profile, setProfile] = useState(() => {
    const loadedProfile = initialProfile ?? createEmptyProfile(userEmail, userId);
    return loadedProfile.work_experience.length > 0
      ? loadedProfile
      : { ...loadedProfile, work_experience: [blankWorkExperience()] };
  });
  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newPreferredLocation, setNewPreferredLocation] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [resumeState, setResumeState] = useState<ResumeState>("empty");
  const [resumeName, setResumeName] = useState(() => initialProfile?.resume_pdf_key?.split("/").pop() ?? "");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadMessage, setResumeUploadMessage] = useState("");
  const [isExtractingProfile, setIsExtractingProfile] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractMessage, setExtractMessage] = useState("");
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generateResumeError, setGenerateResumeError] = useState("");
  const [generateResumeMessage, setGenerateResumeMessage] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completion = calculateCompletion(profile);
  const missingFields = getMissingFields(profile);

  const updateProfile = <K extends keyof Profile>(field: K, value: Profile[K]) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaveState("idle");
    setSaveError("");
  };

  const updateEducation = <K extends keyof Education>(field: K, value: Education[K]) => {
    setProfile((current) => ({
      ...current,
      education: { ...current.education, [field]: value },
    }));
    setSaveState("idle");
    setSaveError("");
  };

  const updateExperience = <K extends keyof WorkExperience>(
    index: number,
    field: K,
    value: WorkExperience[K],
  ) => {
    setProfile((current) => ({
      ...current,
      work_experience: current.work_experience.map((experience, experienceIndex) =>
        experienceIndex === index ? { ...experience, [field]: value } : experience,
      ),
    }));
    setSaveState("idle");
  };

  const addTag = (
    field: "skills" | "industries" | "job_titles_seeking" | "preferred_locations",
    value: string,
    clear: () => void,
  ) => {
    const normalized = value.trim();
    if (!normalized || profile[field].includes(normalized)) {
      return;
    }

    updateProfile(field, [...profile[field], normalized]);
    clear();
  };

  const removeTag = (
    field: "skills" | "industries" | "job_titles_seeking" | "preferred_locations",
    value: string,
  ) => {
    updateProfile(field, profile[field].filter((item) => item !== value));
  };

  const addExperience = () => {
    updateProfile("work_experience", [
      ...profile.work_experience,
      { companyName: "", jobTitle: "", startDate: "", endDate: "", isCurrent: false, responsibilities: [""] },
    ]);
  };

  const removeExperience = (index: number) => {
    if (profile.work_experience.length === 1) {
      return;
    }
    updateProfile(
      "work_experience",
      profile.work_experience.filter((_, experienceIndex) => experienceIndex !== index),
    );
  };

  const toggleRemotePreference = (option: Exclude<Profile["remote_preference"], null>[number]) => {
    setProfile((current) => {
      const selected = current.remote_preference ?? ["any"];
      if (option === "any") {
        return { ...current, remote_preference: ["any"] };
      }

      const withoutAny = selected.filter((value) => value !== "any");
      const next = withoutAny.includes(option)
        ? withoutAny.filter((value) => value !== option)
        : [...withoutAny, option];
      return { ...current, remote_preference: next.length > 0 ? next : ["any"] };
    });
    setSaveState("idle");
    setSaveError("");
  };

  const applyExtractedProfile = (extracted: ExtractedProfile) => {
    setProfile((current) => ({
      ...current,
      full_name: extracted.full_name ?? current.full_name,
      phone: extracted.phone ?? current.phone,
      location: extracted.location ?? current.location,
      current_title: extracted.current_title ?? current.current_title,
      experience_level: extracted.experience_level ?? current.experience_level,
      years_experience: extracted.years_experience ?? current.years_experience,
      skills: extracted.skills?.length ? extracted.skills : current.skills,
      industries: extracted.industries?.length ? extracted.industries : current.industries,
      work_experience: extracted.work_experience?.length
        ? extracted.work_experience.map((experience, index) => ({
            ...current.work_experience[index],
            ...experience,
            responsibilities: experience.responsibilities?.length
              ? experience.responsibilities
              : current.work_experience[index]?.responsibilities,
          }))
        : current.work_experience,
      education: {
        degree: extracted.education?.degree ?? current.education.degree,
        field: extracted.education?.field ?? current.education.field,
        institution: extracted.education?.institution ?? current.education.institution,
        graduationYear: extracted.education?.graduationYear ?? current.education.graduationYear,
      },
      job_titles_seeking: extracted.job_titles_seeking?.length ? extracted.job_titles_seeking : current.job_titles_seeking,
      remote_preference: extracted.remote_preference?.length ? extracted.remote_preference : current.remote_preference,
      preferred_locations: extracted.preferred_locations?.length ? extracted.preferred_locations : current.preferred_locations,
      linkedin_url: extracted.linkedin_url ?? current.linkedin_url,
      portfolio_url: extracted.portfolio_url ?? current.portfolio_url,
    }));
    setSaveState("idle");
    setSaveError("");
  };

  const handleExtractProfile = async () => {
    setIsExtractingProfile(true);
    setExtractError("");
    setExtractMessage("");
    try {
      const result = await extractProfile();
      if (!result.success || !result.profile) {
        setExtractError(result.message);
        return;
      }

      applyExtractedProfile(result.profile);
      setExtractMessage("Profile fields extracted. Review the data and save your profile.");
    } catch (error) {
      console.error("[profile/extract] client request failed", error);
      setExtractError("We could not extract your profile. Please try again.");
    } finally {
      setIsExtractingProfile(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setResumeFile(null);
      setResumeUploadMessage("");
      setResumeState("invalid");
      setResumeError("Please select a PDF file.");
      setResumeName(file.name);
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setResumeFile(null);
      setResumeUploadMessage("");
      setResumeState("invalid");
      setResumeError("Your CV must be smaller than 5 MB.");
      setResumeName(file.name);
      return;
    }

    setResumeState("selected");
    setResumeError("");
    setResumeUploadMessage("");
    setResumeName(file.name);
    setResumeFile(file);

    const formData = new FormData();
    formData.set("resume", file);
    setIsUploadingResume(true);
    try {
      const result = await uploadResume(formData);
      if (!result.success) {
        setResumeState("invalid");
        setResumeError(result.message);
        setResumeFile(null);
        return;
      }

      setProfile((current) => ({
        ...current,
        resume_pdf_url: result.url,
        resume_pdf_key: result.key,
      }));
      setResumeFile(null);
      setResumeUploadMessage("CV uploaded successfully.");
    } catch (error) {
      console.error("[profile/upload-resume] client request failed", error);
      setResumeState("invalid");
      setResumeFile(null);
      setResumeError("The CV upload failed on the server. Please try again.");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleGenerateResume = async () => {
    setIsGeneratingResume(true);
    setGenerateResumeError("");
    setGenerateResumeMessage("");
    try {
      const response = await fetch("/api/resume/generate", { method: "POST" });
      const result = await response.json() as { success?: boolean; error?: string; data?: { key?: string } };
      if (!response.ok || !result.success) {
        setGenerateResumeError(result.error ?? "CV generation failed. Please try again.");
        return;
      }

      const generatedKey = result.data?.key ?? "generated-resume.pdf";
      setResumeName(generatedKey.split("/").pop() ?? "generated-resume.pdf");
      setProfile((current) => ({
        ...current,
        resume_pdf_key: generatedKey,
      }));
      setGenerateResumeMessage("CV generated successfully. Open it using the link below.");
    } catch (error) {
      console.error("[profile/generate-resume] client request failed", error);
      setGenerateResumeError("CV generation failed. Please try again.");
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveState("saving");
    setSaveError("");

    const formData = new FormData();
    formData.set("profile", JSON.stringify(profile));
    if (resumeFile) {
      formData.set("resume", resumeFile);
    }

    const result = await saveProfile(formData);
    if (!result.success || !result.profile) {
      setSaveState("idle");
      setSaveError(result.message);
      return;
    }

    setProfile(result.profile);
    setResumeFile(null);
    setSaveState("saved");
  };

  return (
    <main className="bg-background px-4 py-8 sm:px-8 lg:px-20 lg:py-12">
      <PostHogIdentify userId={userId} email={userEmail} />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        {missingFields.length > 0 ? (
          <ProfileAttentionBanner completion={completion} missingFields={missingFields} />
        ) : null}
        <ResumeSection
          fileInputRef={fileInputRef}
          isDragging={isDragging}
          resumeName={resumeName}
          existingResumeKey={profile.resume_pdf_key}
          isUploading={isUploadingResume}
          uploadMessage={resumeUploadMessage}
          canExtract={Boolean(profile.resume_pdf_key)}
          isExtracting={isExtractingProfile}
          extractError={extractError}
          extractMessage={extractMessage}
          isGenerating={isGeneratingResume}
          generateError={generateResumeError}
          generateMessage={generateResumeMessage}
          onExtract={handleExtractProfile}
          onGenerate={handleGenerateResume}
          resumeError={resumeError}
          isInvalid={resumeState === "invalid"}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onSelect={() => fileInputRef.current?.click()}
        />

        <ProfileForm saveState={saveState} saveError={saveError} onSubmit={handleSubmit}>
            <Section title="Personal Info">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full Name"><input className={inputClassName} value={profile.full_name ?? ""} onChange={(event) => updateProfile("full_name", event.target.value)} /></Field>
                <Field label="Email"><input className={`${inputClassName} bg-surface-secondary text-text-secondary`} value={profile.email ?? ""} disabled /></Field>
                <Field label="Phone Number"><input className={inputClassName} placeholder="+1 (555) 000-0000" value={profile.phone ?? ""} onChange={(event) => updateProfile("phone", event.target.value)} /></Field>
                <Field label="Location"><input className={inputClassName} placeholder="City, Country" value={profile.location ?? ""} onChange={(event) => updateProfile("location", event.target.value)} /></Field>
                <Field label="LinkedIn URL"><input className={inputClassName} value={profile.linkedin_url ?? ""} onChange={(event) => updateProfile("linkedin_url", event.target.value)} /></Field>
                <Field label="Portfolio / GitHub"><input className={inputClassName} value={profile.portfolio_url ?? ""} onChange={(event) => updateProfile("portfolio_url", event.target.value)} /></Field>
                <Field label="Work Authorization"><select className={selectClassName} value={profile.work_authorization ?? ""} onChange={(event) => updateProfile("work_authorization", event.target.value as Profile["work_authorization"])}><option value="citizen">Citizen</option><option value="permanent_resident">Permanent Resident</option><option value="visa_required">Visa Required</option></select></Field>
              </div>
            </Section>

            <Section title="Professional Info">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><Field label="Current / Recent Job Title"><input className={inputClassName} value={profile.current_title ?? ""} onChange={(event) => updateProfile("current_title", event.target.value)} /></Field></div>
                <Field label="Experience Level"><select className={selectClassName} value={profile.experience_level ?? ""} onChange={(event) => updateProfile("experience_level", event.target.value as Profile["experience_level"])}><option value="junior">Junior</option><option value="mid">Mid</option><option value="senior">Senior</option><option value="lead">Lead</option></select></Field>
                <Field label="Years of Experience"><input className={inputClassName} type="number" min="0" value={profile.years_experience ?? ""} onChange={(event) => updateProfile("years_experience", event.target.value === "" ? null : Number(event.target.value))} /></Field>
              </div>
              <div className="mt-5">
                <Field label="Skills"><div className="flex gap-2"><input className={inputClassName} placeholder="Add a skill" value={newSkill} onChange={(event) => setNewSkill(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag("skills", newSkill, () => setNewSkill("")); } }} /><button type="button" className="focus-ring min-h-11 cursor-pointer rounded-md bg-surface-muted px-4 text-xs font-bold text-text-dark transition-colors hover:bg-surface-secondary" onClick={() => addTag("skills", newSkill, () => setNewSkill(""))}>Add</button></div></Field>
                <div className="mt-3"><TagList items={profile.skills} onRemove={(item) => removeTag("skills", item)} /></div>
              </div>
              <div className="mt-5"><Field label="Industries Worked In (Optional)"><div className="flex gap-2"><input className={inputClassName} placeholder="E.g. FinTech, Healthcare" value={newIndustry} onChange={(event) => setNewIndustry(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag("industries", newIndustry, () => setNewIndustry("")); } }} /><button type="button" className="focus-ring min-h-11 cursor-pointer rounded-md bg-surface-muted px-4 text-xs font-bold text-text-dark transition-colors hover:bg-surface-secondary" onClick={() => addTag("industries", newIndustry, () => setNewIndustry(""))}>Add</button></div></Field></div>
            </Section>

            <Section title="Work Experience">
              <div className="flex items-center justify-between"><span className="text-xs text-text-secondary">Add the roles that best represent your experience.</span><button type="button" className="focus-ring cursor-pointer text-xs font-bold text-accent transition-colors hover:text-accent-dark" onClick={addExperience}>+ Add role</button></div>
              <div className="mt-4 space-y-4">
                {profile.work_experience.map((experience, index) => <div key={index} className="rounded-md border border-border bg-surface-secondary p-4"><div className="grid gap-4 md:grid-cols-2"><Field label="Company Name"><input className={inputClassName} value={experience.companyName ?? ""} onChange={(event) => updateExperience(index, "companyName", event.target.value)} /></Field><Field label="Job Title"><input className={inputClassName} value={experience.jobTitle ?? ""} onChange={(event) => updateExperience(index, "jobTitle", event.target.value)} /></Field><div className="grid gap-4 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"><Field label="Start Date"><input className={`${inputClassName} cursor-pointer`} type="month" value={experience.startDate ?? ""} onChange={(event) => updateExperience(index, "startDate", event.target.value)} /></Field>{experience.isCurrent ? <div className="hidden sm:block" /> : <Field label="End Date"><input className={`${inputClassName} cursor-pointer`} type="month" value={experience.endDate ?? ""} onChange={(event) => updateExperience(index, "endDate", event.target.value)} /></Field>}<label className="group flex min-h-11 cursor-pointer items-center gap-3 text-xs text-text-secondary sm:pb-3"><input className="peer sr-only" type="checkbox" checked={Boolean(experience.isCurrent)} onChange={(event) => updateExperience(index, "isCurrent", event.target.checked)} /><span aria-hidden="true" className="flex size-5 items-center justify-center rounded-sm border border-border-muted bg-surface transition-colors group-hover:border-accent peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"><Check className="size-3.5 text-accent-foreground transition-opacity" /></span><span>Currently working here</span></label></div><div className="sm:col-span-2"><Field label="Key Responsibilities"><textarea className={`${inputClassName} min-h-24 cursor-text py-3`} value={(experience.responsibilities ?? []).join("\n")} onChange={(event) => updateExperience(index, "responsibilities", event.target.value.split("\n"))} /></Field></div></div>{profile.work_experience.length > 1 ? <button type="button" className="focus-ring mt-3 cursor-pointer text-xs font-semibold text-error" onClick={() => removeExperience(index)}>Remove role</button> : null}</div>)}
              </div>
            </Section>

            <Section title="Education">
              <div className="grid gap-5 md:grid-cols-2"><Field label="Highest Degree"><select className={selectClassName} value={profile.education.degree ?? ""} onChange={(event) => updateEducation("degree", event.target.value)}><option value="high_school">High School</option><option value="associate">Associate</option><option value="bachelor">Bachelor&apos;s Degree</option><option value="master">Master&apos;s Degree</option><option value="doctorate">Doctorate</option></select></Field><Field label="Field of Study"><input className={inputClassName} value={profile.education.field ?? ""} onChange={(event) => updateEducation("field", event.target.value)} /></Field><Field label="Institution Name"><input className={inputClassName} placeholder="E.g. State University" value={profile.education.institution ?? ""} onChange={(event) => updateEducation("institution", event.target.value)} /></Field><Field label="Graduation Year"><input className={inputClassName} placeholder="YYYY" value={profile.education.graduationYear ?? ""} onChange={(event) => updateEducation("graduationYear", event.target.value)} /></Field></div>
            </Section>

            <Section title="Job Preferences">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Job Titles Seeking">
                    <div className="flex gap-2"><input className={inputClassName} placeholder="Add a role" value={newJobTitle} onChange={(event) => setNewJobTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag("job_titles_seeking", newJobTitle, () => setNewJobTitle("")); } }} /><button type="button" className="focus-ring min-h-11 cursor-pointer rounded-md bg-surface-muted px-4 text-xs font-bold text-text-dark transition-colors hover:bg-surface-secondary" onClick={() => addTag("job_titles_seeking", newJobTitle, () => setNewJobTitle(""))}>Add</button></div>
                  </Field>
                  <div className="mt-3"><TagList items={profile.job_titles_seeking} onRemove={(item) => removeTag("job_titles_seeking", item)} /></div>
                </div>
                <fieldset className="flex flex-col gap-2">
                  <legend className={labelClassName}>Remote Preference</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["any", "remote", "hybrid", "onsite"] as const).map((option) => (
                      <label key={option} className="group flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-3 text-sm text-text-primary transition-colors hover:border-accent hover:bg-surface-secondary">
                        <input className="peer sr-only" type="checkbox" checked={Boolean(profile.remote_preference?.includes(option))} onChange={() => toggleRemotePreference(option)} />
                        <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-sm border border-border-muted bg-surface transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"><Check className="size-3.5 text-accent-foreground transition-opacity" /></span>
                        <span>{option === "any" ? "Any" : option[0].toUpperCase() + option.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label="Salary Expectation (Optional)"><input className={inputClassName} placeholder="E.g. $85k+" value={profile.salary_expectation ?? ""} onChange={(event) => updateProfile("salary_expectation", event.target.value)} /></Field>
                <div className="md:col-span-2">
                  <Field label="Preferred Locations (Optional)">
                    <div className="flex gap-2"><input className={inputClassName} placeholder="E.g. New York, London" value={newPreferredLocation} onChange={(event) => setNewPreferredLocation(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag("preferred_locations", newPreferredLocation, () => setNewPreferredLocation("")); } }} /><button type="button" className="focus-ring min-h-11 cursor-pointer rounded-md bg-surface-muted px-4 text-xs font-bold text-text-dark transition-colors hover:bg-surface-secondary" onClick={() => addTag("preferred_locations", newPreferredLocation, () => setNewPreferredLocation(""))}>Add</button></div>
                  </Field>
                  <div className="mt-3"><TagList items={profile.preferred_locations} onRemove={(item) => removeTag("preferred_locations", item)} /></div>
                </div>
                <Field label="Cover Letter Tone"><select className={selectClassName} value={profile.cover_letter_tone ?? ""} onChange={(event) => updateProfile("cover_letter_tone", event.target.value as Profile["cover_letter_tone"])}><option value="enthusiastic">Enthusiastic</option><option value="formal">Formal</option><option value="casual">Casual</option></select></Field>
              </div>
            </Section>
        </ProfileForm>
      </div>
    </main>
  );
}
