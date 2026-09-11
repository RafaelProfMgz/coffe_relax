"use client";

import Link from "next/link";
import { useConsent } from "@/hooks/useConsent";
import { SITE } from "@/lib/site";

export default function SiteFooter() {
  const { openPanel } = useConsent();

  return (
    <footer className="footer">
      <p className="footer-quote">
        “Um refúgio com som de chuva, teclas mecânicas e cheiro de café recém-passado.”
      </p>

      <nav className="footer-nav" aria-label="Links do rodapé">
        <Link href="/">Início</Link>
        <Link href="/termos">Termos de Serviço</Link>
        <Link href="/privacidade">Política de Privacidade</Link>
        <a href={SITE.repo} target="_blank" rel="noopener noreferrer">
          Código-fonte ↗
        </a>
        <button className="footer-link-btn" onClick={openPanel}>
          Preferências de privacidade
        </button>
      </nav>

      <p className="footer-meta">
        {SITE.name} — Next.js · Web Audio API · YouTube IFrame API · localStorage · sem rastreamento
      </p>
    </footer>
  );
}
