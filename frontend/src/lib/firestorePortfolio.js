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

/** Normalize Firestore blog doc for UI (BlogPage + admin). */
export function normalizeBlogDoc(id, data) {
  if (!data) return { id };
  return {
    ...data,
    id,
    title: String(data.title || "").trim(),
    excerpt: String(data.excerpt || "").trim(),
    content: String(data.content || "").trim(),
    category: String(data.category || "General").trim(),
    readTime: String(data.readTime || "").trim(),
    coverImage: String(data.coverImage || "").trim(),
    slug: String(data.slug || "").trim(),
    publishedAt: String(data.publishedAt || "").trim(),
    externalUrl: String(data.externalUrl || "").trim(),
    featured: Boolean(data.featured),
  };
}
