const DEFAULT_ABOUT = {
  headline: "About me",
  overview: "",
  journey: [],
  focusAreas: [],
  principles: [],
};

function normalizeJourneyItem(item) {
  if (!item || typeof item !== "object") {
    return { title: "", period: "", description: "" };
  }
  return {
    title: String(item.title || "").trim(),
    period: String(item.period || "").trim(),
    description: String(item.description || "").trim(),
  };
}

export function normalizeAboutContent(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    headline: String(source.headline || DEFAULT_ABOUT.headline || "").trim(),
    overview: String(source.overview || DEFAULT_ABOUT.overview || "").trim(),
    journey: (Array.isArray(source.journey) ? source.journey : DEFAULT_ABOUT.journey || [])
      .map(normalizeJourneyItem)
      .filter((item) => item.title || item.description),
    focusAreas: (Array.isArray(source.focusAreas)
      ? source.focusAreas
      : DEFAULT_ABOUT.focusAreas || []
    )
      .map((item) => String(item || "").trim())
      .filter(Boolean),
    principles: (Array.isArray(source.principles)
      ? source.principles
      : DEFAULT_ABOUT.principles || []
    )
      .map((item) => String(item || "").trim())
      .filter(Boolean),
  };
}

export const defaultAboutContent = normalizeAboutContent(DEFAULT_ABOUT);
