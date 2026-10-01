/**
 * Configuração central do site — um único lugar para mexer no domínio,
 * no e-mail de contato e nos textos que aparecem no SEO e nas páginas legais.
 *
 * O domínio vem de NEXT_PUBLIC_SITE_URL (defina na Vercel / no .env)
 * e cai no subdomínio de produção quando a variável não existe.
 */

/** Valor de variável de ambiente sem espaços nem ponto final colado por engano ("contato@x.com.br."). */
function cleanEmail(value: string | undefined) {
  return value?.trim().replace(/\.+$/, "") ?? "";
}

export const SITE = {
  name: "coffe to relax",
  shortName: "coffe relax",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://coffe.lotmhub.com.br").replace(/\/$/, ""),
  locale: "pt_BR",
  tagline: "Uma cafeteria digital para focar com calma",
  description:
    "Ambiente de foco com sons relaxantes gerados ao vivo no navegador, playlist do YouTube salva localmente, pomodoro, mural de notas e modo noite. Sem conta, sem rastreamento.",
  /** E-mail público de contato usado nas páginas legais e no formulário. Pode ser trocado em NEXT_PUBLIC_CONTACT_EMAIL. */
  contactEmail: cleanEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL) || "rafaelprojmgz@gmail.com",
  author: "RafaelProfMgz",
  repo: "https://github.com/RafaelProfMgz/coffe_relax",
  /** Domínio principal do qual este site é um subdomínio. */
  hub: "https://www.lotmhub.com.br",
  /** Data da última revisão dos termos e da política. */
  legalUpdatedAt: "2026-10-01",
} as const;

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

/** Páginas institucionais, na ordem do rodapé. O sitemap e o llms.txt partem da mesma lista. */
export const SITE_PAGES = [
  { href: "/sobre", label: "Sobre" },
  { href: "/docs", label: "Como usar" },
  { href: "/faq", label: "Perguntas frequentes" },
  { href: "/sistema", label: "Sistema" },
  { href: "/contato", label: "Contato" },
  { href: "/termos", label: "Termos de Serviço" },
  { href: "/privacidade", label: "Política de Privacidade" },
] as const;

/** Data legível ("01 de outubro de 2026") da última revisão dos textos legais. */
export const legalUpdatedLabel = new Date(`${SITE.legalUpdatedAt}T12:00:00Z`).toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
