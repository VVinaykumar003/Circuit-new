export const getOrganizationSlug = (): string => {
  const slug = sessionStorage.getItem("slug");
  if (slug) return slug;

  const userData = sessionStorage.getItem("user");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.slug || user.organization || user.name || "";
    } catch (error) {
      console.error("Failed to parse user data from session storage:", error);
    }
  }
  return "";
};