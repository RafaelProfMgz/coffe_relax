/**
 * Configuração central do site — um único lugar para mexer no domínio,
 * no e-mail de contato e nos textos que aparecem no SEO e nas páginas legais.
 *
 * O domínio vem de NEXT_PUBLIC_SITE_URL (defina na Vercel / no .env)
 * e cai no valor abaixo quando a variável não existe.
 */
export const SITE = {
  name: "coffe to relax",
  shortName: "coffe relax",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://coffe-relax.vercel.app").replace(/\/$/, ""),
  locale: "pt_BR",
  tagline: "Uma cafeteria digital para focar com calma",
  description:
    "Ambiente de foco com sons relaxantes gerados ao vivo no navegador, playlist do YouTube salva localmente, pomodoro, mural de notas e modo noite. Sem conta, sem rastreamento.",
  /** E-mail público de contato usado nas páginas legais. */
  contactEmail: "rafaelprojmgz@gmail.com",
  author: "RafaelProfMgz",
  repo: "https://github.com/RafaelProfMgz/coffe_relax",
  /** Data da última revisão dos termos e da política. */
  legalUpdatedAt: "2026-09-11",
} as const;

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
