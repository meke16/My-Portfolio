const DEFAULT_ABOUT_CONTENT = {
  headline: "About me",
  overview: "",
  journey: [],
  focusAreas: [],
  principles: [],
};

const DEFAULT_WORK_EXPERIENCE = {
  headline: "Work & Experience",
  intro: "",
  experiences: [],
};

function normalizeJourneyItem(item) {
  const src = item && typeof item === "object" ? item : {};
  return {
    title: String(src.title || "").trim(),
    period: String(src.period || "").trim(),
    description: String(src.description || "").trim(),
  };
}

export function normalizeAboutContent(input) {
  const src = input && typeof input === "object" ? input : {};
  return {
    headline: String(src.headline || DEFAULT_ABOUT_CONTENT.headline).trim(),
    overview: String(src.overview || "").trim(),
    journey: (Array.isArray(src.journey) ? src.journey : [])
      .map(normalizeJourneyItem)
      .filter((item) => item.title || item.description),
    focusAreas: (Array.isArray(src.focusAreas) ? src.focusAreas : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean),
    principles: (Array.isArray(src.principles) ? src.principles : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean),
  };
}

function normalizeExperienceItem(item, index) {
  const src = item && typeof item === "object" ? item : {};
  return {
    id: String(src.id || `exp-${index + 1}`),
    role: String(src.role || "").trim(),
    company: String(src.company || "").trim(),
    period: String(src.period || "").trim(),
    location: String(src.location || "").trim(),
    type: String(src.type || "").trim(),
    summary: String(src.summary || "").trim(),
    highlights: (Array.isArray(src.highlights) ? src.highlights : [])
      .map((h) => String(h || "").trim())
      .filter(Boolean),
  };
}

export function normalizeWorkExperience(input) {
  const src = input && typeof input === "object" ? input : {};
  return {
    headline: String(src.headline || DEFAULT_WORK_EXPERIENCE.headline).trim(),
    intro: String(src.intro || "").trim(),
    experiences: (Array.isArray(src.experiences) ? src.experiences : [])
      .map(normalizeExperienceItem)
      .filter((item) => item.role || item.company || item.summary),
  };
}

export const defaultAboutContent = normalizeAboutContent(DEFAULT_ABOUT_CONTENT);
export const defaultWorkExperience = normalizeWorkExperience(DEFAULT_WORK_EXPERIENCE);
