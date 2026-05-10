/**
 * Generate a URL-safe slug from a title or name.
 * Used for auto-generating slug from title (pages, articles) or casinoName (casinos).
 */
export function slugFromTitle(text: string): string {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "";
}
