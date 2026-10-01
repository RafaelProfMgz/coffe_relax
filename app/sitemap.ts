import type { MetadataRoute } from "next";
import { absoluteUrl, SITE, SITE_PAGES } from "@/lib/site";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const legalDate = new Date(`${SITE.legalUpdatedAt}T12:00:00Z`);
  const now = new Date();
  const legal = new Set(["/termos", "/privacidade"]);

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...SITE_PAGES.filter((p) => p.href !== "/docs").map((p) => ({
      url: absoluteUrl(p.href),
      lastModified: legal.has(p.href) ? legalDate : now,
      changeFrequency: legal.has(p.href) ? ("yearly" as const) : ("monthly" as const),
      priority: legal.has(p.href) ? 0.4 : 0.6,
    })),
    ...source.getPages().map((page) => ({
      url: absoluteUrl(page.url),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: page.url === "/docs" ? 0.8 : 0.6,
    })),
  ];
}
