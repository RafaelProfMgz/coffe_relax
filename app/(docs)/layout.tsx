import type { Metadata, Viewport } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { docsTranslations } from "@/lib/docs-i18n";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import "../docs.css";

/*
  Layout raiz próprio da documentação: o Fumadocs traz o Tailwind (com o reset dele), que não pode
  vazar para o café. Como são layouts raiz diferentes, ir do app para /docs recarrega a página inteira.
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `Como usar — ${SITE.name}`, template: `%s — ${SITE.name}` },
  description: `Guia do ${SITE.name}: sons ambientes, playlist do YouTube, pomodoro, notas, clima e privacidade.`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f0e2" },
    { media: "(prefers-color-scheme: dark)", color: "#211c19" },
  ],
  colorScheme: "light dark",
};

export default function DocsRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/* Tema segue o sistema (sem gravar nada no navegador); a busca usa /api/search */}
        <RootProvider theme={{ enabled: false }} i18n={{ locale: "pt-BR", translations: docsTranslations }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
