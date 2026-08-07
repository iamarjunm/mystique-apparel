import { fetchProducts } from "@/lib/fetchProducts";

export default async function sitemap() {
  const baseUrl = "https://mystiqueapparel.in";

  // Fetch all products
  const products = await fetchProducts();

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`, // the route uses [id], not slug, in Mystique Apparel right now
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Define static routes
  const staticRoutes = [
    "",
    "/about",
    "/shop",
    "/contact",
    "/collections",
    "/categories",
    "/privacy-policy",
    "/terms-conditions",
    "/refund-policy",
    "/shipping-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/shop" ? "daily" : "monthly",
    priority: route === "" ? 1.0 : 0.7,
  }));

  return [...staticRoutes, ...productUrls];
}
