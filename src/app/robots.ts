import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/not-found"] },
    sitemap: "https://tuman.help/sitemap.xml",
  };
}
