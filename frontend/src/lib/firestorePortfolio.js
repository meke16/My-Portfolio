/** Normalize Firestore project doc for UI (ProjectsSection + admin). */
export function normalizeProjectDoc(id, data) {
  if (!data) return { id };
  const technologies =
    data.technologies ??
    (Array.isArray(data.tech) ? data.tech.filter(Boolean).join(", ") : "") ??
    "";
  return {
    ...data,
    id,
    github_url: data.github_url || data.github || "",
    url: data.url || data.live || "",
    technologies,
    image: Array.isArray(data.image)
      ? data.image
      : data.image
        ? [data.image]
        : [],
    featured: Boolean(data.featured),
    year: data.year || "",
  };
}
