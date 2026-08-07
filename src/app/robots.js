export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/studio/"],
    },
    sitemap: "https://mystiqueapparel.in/sitemap.xml",
  };
}
