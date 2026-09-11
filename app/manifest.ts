import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f0e2",
    theme_color: "#c65a1e",
    lang: "pt-BR",
    categories: ["productivity", "lifestyle", "music"],
    icons: [
      // SVG escala em qualquer densidade; o PNG cobre o iOS, que não aceita SVG
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
