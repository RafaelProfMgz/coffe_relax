"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { consentStore, purgePreferences, setStorageAllowed } from "@/lib/storage";

/** Versão do texto de consentimento — subir aqui faz o banner reaparecer. */
const CONSENT_VERSION = 1;

export interface ConsentState {
  /** Salvar playlist, notas, volume e tema no navegador. */
  preferences: boolean;
  /** Usar a localização do navegador para o clima. */
  geolocation: boolean;
  version: number;
  decidedAt: string;
}

interface ConsentApi {
  /** false até lermos o localStorage — componentes esperam antes de tocar em storage. */
  ready: boolean;
  /** null = usuário ainda não decidiu; o banner está aberto. */
  consent: ConsentState | null;
  /** Atalhos de leitura. */
  allowPreferences: boolean;
  allowGeolocation: boolean;
  /** Salva uma decisão (parcial ou completa). */
  decide: (choice: Partial<Pick<ConsentState, "preferences" | "geolocation">>) => void;
  /** Apaga a decisão e todos os dados guardados. */
  revoke: () => void;
  /** Controla o painel de preferências. */
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
}

const ConsentContext = createContext<ConsentApi | null>(null);

function parse(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      preferences: Boolean(parsed.preferences),
      geolocation: Boolean(parsed.geolocation),
      version: CONSENT_VERSION,
      decidedAt: parsed.decidedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // Primeira leitura: roda depois da hidratação, então o HTML do servidor
  // e o do cliente batem e o banner não "pisca" em quem já decidiu.
  useEffect(() => {
    const saved = parse(consentStore.read());
    setStorageAllowed(saved?.preferences ?? false);
    setConsent(saved);
    setReady(true);
  }, []);

  const decide = useCallback((choice: Partial<Pick<ConsentState, "preferences" | "geolocation">>) => {
    setConsent((prev) => {
      const next: ConsentState = {
        preferences: choice.preferences ?? prev?.preferences ?? false,
        geolocation: choice.geolocation ?? prev?.geolocation ?? false,
        version: CONSENT_VERSION,
        decidedAt: new Date().toISOString(),
      };
      setStorageAllowed(next.preferences);
      consentStore.write(JSON.stringify(next));
      // Recusou depois de ter aceitado? Então o que já foi salvo precisa sair.
      if (!next.preferences) purgePreferences();
      return next;
    });
    setPanelOpen(false);
  }, []);

  const revoke = useCallback(() => {
    setStorageAllowed(false);
    purgePreferences();
    consentStore.clear();
    setConsent(null);
    setPanelOpen(false);
  }, []);

  const api = useMemo<ConsentApi>(
    () => ({
      ready,
      consent,
      allowPreferences: consent?.preferences ?? false,
      allowGeolocation: consent?.geolocation ?? false,
      decide,
      revoke,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
    }),
    [ready, consent, decide, revoke, panelOpen]
  );

  return <ConsentContext.Provider value={api}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentApi {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent precisa estar dentro de <ConsentProvider>");
  return ctx;
}
