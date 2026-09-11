import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nada aqui é privado, mas artefatos de build não precisam ser rastreados
        disallow: ["/_next/static/chunks/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE.url,
  };
}
