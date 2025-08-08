export const findParentIdBySlug = (slug: string) => {
  const parentId = slug.split("/").slice(0, -1).join("/");
  return parentId;
};

export const generateStoryblokSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
