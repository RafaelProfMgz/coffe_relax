import type { Metadata, Viewport } from "next";
import { Fira_Code, Cormorant_Garamond, Inter } from "next/font/google";
import Providers from "./providers";
import { SITE, absoluteUrl } from "@/lib/site";
import "./globals.css";

/* Fontes servidas pelo próprio domínio: sem requisição a servidores de terceiros. */
const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fira",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author, url: SITE.repo }],
  creator: SITE.author,
  publisher: SITE.author,
  keywords: [
    "sons relaxantes",
    "ruído de chuva",
    "ambiente de foco",
    "lo-fi para estudar",
    "ruído branco",
    "pomodoro online",
    "playlist do youtube offline",
    "sons para concentração",
    "ASMR ambiente",
    "cafeteria sonora",
    "gerador de som ambiente",
    "sem rastreamento",
  ],
  category: "productivity",
  alternates: {
    canonical: absoluteUrl("/"),
    languages: { "pt-BR": absoluteUrl("/") },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: absoluteUrl("/"),
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f0e2" },
    { media: "(prefers-color-scheme: dark)", color: "#211c19" },
  ],
  colorScheme: "light dark",
};

/** Dados estruturados: ajudam o Google a entender que isto é um app web gratuito. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": absoluteUrl("/#app"),
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Qualquer navegador moderno",
      inLanguage: "pt-BR",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      featureList: [
        "Sons ambientes sintetizados ao vivo",
        "Playlist do YouTube salva no navegador",
        "Timer pomodoro",
        "Mural de notas",
        "Modo noite",
      ],
      author: { "@type": "Person", name: SITE.author, url: SITE.repo },
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#site"),
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "pt-BR",
      publisher: { "@type": "Person", name: SITE.author },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="light"
      className={`${firaCode.variable} ${cormorant.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
