"use client";

import Link from "next/link";
import { useConsent } from "@/hooks/useConsent";
import { SITE, SITE_PAGES } from "@/lib/site";

export default function SiteFooter() {
  const { openPanel } = useConsent();

  return (
    <footer className="footer">
      <p className="footer-quote">
        “Um refúgio com som de chuva, teclas mecânicas e cheiro de café recém-passado.”
      </p>

      <nav className="footer-nav" aria-label="Links do rodapé">
        <Link href="/">Início</Link>
        {SITE_PAGES.map((page) => (
          <Link key={page.href} href={page.href}>
            {page.label}
          </Link>
        ))}
        <a href={SITE.repo} target="_blank" rel="noopener noreferrer">
          Código-fonte ↗
        </a>
        <button className="footer-link-btn" onClick={openPanel}>
          Preferências de privacidade
        </button>
      </nav>

      <p className="footer-meta">
        {SITE.name} — um projeto do <a href={SITE.hub}>lotmhub</a> · Next.js · Web Audio API · sem
        rastreamento
      </p>
    </footer>
  );
}
