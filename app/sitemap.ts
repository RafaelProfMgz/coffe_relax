import type { MetadataRoute } from "next";
import { absoluteUrl, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const legalDate = new Date(SITE.legalUpdatedAt);
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/privacidade"),
      lastModified: legalDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/termos"),
      lastModified: legalDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
