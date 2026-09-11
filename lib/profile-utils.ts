import type { MissingField, Profile } from "@/types";

function hasWorkExperience(profile: Profile): boolean {
  return profile.work_experience.some((experience) => Boolean(
    experience.companyName ||
    experience.jobTitle ||
    experience.startDate ||
    experience.responsibilities?.some(Boolean),
  ));
}

export function getMissingFields(profile: Profile): MissingField[] {
  const fields: Array<[MissingField, boolean]> = [
    ["FULL NAME", Boolean(profile.full_name)],
    ["PHONE", Boolean(profile.phone)],
    ["LOCATION", Boolean(profile.location)],
    ["JOB TITLE", Boolean(profile.current_title)],
    ["EXPERIENCE LEVEL", Boolean(profile.experience_level)],
    ["YEARS EXP", profile.years_experience !== null],
    ["SKILLS", profile.skills.length > 0],
    ["WORK EXPERIENCE", hasWorkExperience(profile)],
    ["EDUCATION", Boolean(profile.education.institution)],
  ];

  return fields.filter(([, isComplete]) => !isComplete).map(([field]) => field);
}

export function calculateCompletion(profile: Profile): number {
  return Math.round(((9 - getMissingFields(profile).length) / 9) * 100);
}
