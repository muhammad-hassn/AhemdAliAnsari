import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://zahraluxe.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/account/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
