// Tab id <-> URL slug. Tab ids stay stable (content wiring / testimonials gate
// depend on them); URLs get pretty slugs. Keep in sync with next.config.ts rewrites.
export const TAB_SLUGS: Record<string, string> = {
  work: "case-studies",
  playground: "ui-designs",
  ai: "ai",
  about: "about",
};

export const SLUG_TABS: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_SLUGS).map(([id, slug]) => [slug, id]),
);
