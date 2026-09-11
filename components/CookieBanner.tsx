"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConsent } from "@/hooks/useConsent";

/**
 * Banner de consentimento. Aparece na primeira visita e sempre que o
 * usuário reabrir as preferências pelo rodapé.
 *
 * Não usamos sons aqui de propósito: o áudio ainda não foi ligado e
 * ninguém merece um bipe surpresa antes de escolher qualquer coisa.
 */
export default function CookieBanner() {
  const { ready, consent, panelOpen, closePanel, decide, revoke, allowPreferences, allowGeolocation } = useConsent();
  const [prefs, setPrefs] = useState(false);
  const [geo, setGeo] = useState(false);

  const needsDecision = ready && consent === null;
  const open = needsDecision || panelOpen;

  // Ao abrir o painel, os toggles partem do que já está valendo
  useEffect(() => {
    if (!open) return;
    setPrefs(allowPreferences || consent === null);
    setGeo(allowGeolocation);
  }, [open, allowPreferences, allowGeolocation, consent]);

  // Esc fecha o painel (só quando já existe uma decisão salva)
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, closePanel]);

  if (!open) return null;

  return (
    <div className="consent-wrap" role="dialog" aria-modal="false" aria-labelledby="consent-title">
      <div className="consent-card">
        <div className="consent-head">
          <span className="consent-icon" aria-hidden>
            🍪
          </span>
          <div>
            <h2 className="consent-title" id="consent-title">
              Um café e um combinado
            </h2>
            <p className="consent-text">
              Este site não tem contas, anúncios nem rastreamento. Só precisamos da sua permissão para
              guardar coisas <strong>no seu próprio navegador</strong> — nada disso sai do seu computador.
            </p>
          </div>
        </div>

        <div className="consent-options">
          <div className="consent-row is-locked">
            <div className="consent-row-text">
              <strong>Estritamente necessário</strong>
              <span>Guarda apenas esta escolha, para não perguntarmos de novo. Sempre ativo.</span>
            </div>
            <span className="consent-lock">sempre ativo</span>
          </div>

          <label className="consent-row">
            <div className="consent-row-text">
              <strong>Preferências</strong>
              <span>Sua playlist do YouTube, notas, volume e modo noite, salvos no navegador.</span>
            </div>
            <input
              type="checkbox"
              className="consent-check"
              checked={prefs}
              onChange={(e) => setPrefs(e.target.checked)}
              aria-label="Permitir salvar preferências no navegador"
            />
          </label>

          <label className="consent-row">
            <div className="consent-row-text">
              <strong>Localização</strong>
              <span>
                Usa a localização do navegador só para mostrar o clima da sua região. O seu navegador ainda
                vai pedir confirmação.
              </span>
            </div>
            <input
              type="checkbox"
              className="consent-check"
              checked={geo}
              onChange={(e) => setGeo(e.target.checked)}
              aria-label="Permitir uso da localização"
            />
          </label>
        </div>

        <div className="consent-actions">
          <button className="btn btn-solid" onClick={() => decide({ preferences: true, geolocation: true })}>
            aceitar tudo
          </button>
          <button className="btn" onClick={() => decide({ preferences: prefs, geolocation: geo })}>
            salvar escolha
          </button>
          <button className="btn btn-outline" onClick={() => decide({ preferences: false, geolocation: false })}>
            só o necessário
          </button>
          {consent !== null && (
            <>
              <button className="btn btn-outline" onClick={revoke} title="Apaga a decisão e os dados guardados">
                apagar meus dados
              </button>
              <button className="btn" onClick={closePanel}>
                fechar
              </button>
            </>
          )}
        </div>

        <p className="consent-links">
          <Link href="/privacidade">Política de Privacidade</Link>
          <span aria-hidden> · </span>
          <Link href="/termos">Termos de Serviço</Link>
        </p>
      </div>
    </div>
  );
}
