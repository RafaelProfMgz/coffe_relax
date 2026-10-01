"use client";

import { useEffect, useState } from "react";

type Result = "ok" | "warn" | "fail";
type Check = { label: string; result: Result; detail: string };

const ICON: Record<Result, string> = { ok: "✓", warn: "!", fail: "✕" };

/** Testes que rodam só no seu navegador, sem nenhuma chamada de rede. */
function browserChecks(): Check[] {
  const w = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  let storage: Check;
  try {
    const k = "__coffe_probe__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    storage = { label: "Armazenamento local", result: "ok", detail: "Disponível para salvar playlist e notas (com o seu aceite)." };
  } catch {
    storage = {
      label: "Armazenamento local",
      result: "warn",
      detail: "Bloqueado (janela anônima ou cookies desativados). O app funciona, mas esquece tudo ao recarregar.",
    };
  }

  return [
    {
      label: "Web Audio API",
      result: w.AudioContext || w.webkitAudioContext ? "ok" : "fail",
      detail:
        w.AudioContext || w.webkitAudioContext
          ? "Os sons ambientes e os cliques podem ser gerados aqui."
          : "Sem ela não há som ambiente. Atualize o navegador.",
    },
    storage,
    {
      label: "Pointer Events",
      result: "PointerEvent" in window ? "ok" : "warn",
      detail: "PointerEvent" in window ? "Dá para arrastar as notas do mural." : "Arrastar as notas pode não funcionar.",
    },
    {
      label: "Geolocalização",
      result: "geolocation" in navigator ? "ok" : "warn",
      detail:
        "geolocation" in navigator
          ? "Disponível, mas só é usada se você pedir o clima do seu lugar."
          : "Indisponível: o clima continua com São Paulo.",
    },
    {
      label: "Conexão",
      result: navigator.onLine ? "ok" : "warn",
      detail: navigator.onLine ? "On-line." : "Sem internet: sons e notas funcionam, playlist e clima não.",
    },
    {
      label: "Movimento reduzido",
      result: "ok",
      detail: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "Ativado no sistema: as animações ficam mais discretas."
        : "Desativado: animações completas.",
    },
  ];
}

async function probe(label: string, url: string, init?: RequestInit): Promise<Check> {
  const started = performance.now();
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000), ...init });
    const ms = Math.round(performance.now() - started);
    return res.ok || res.type === "opaque"
      ? { label, result: "ok", detail: `Respondeu em ${ms} ms.` }
      : { label, result: "warn", detail: `Respondeu com erro ${res.status}.` };
  } catch {
    return { label, result: "fail", detail: "Não respondeu (fora do ar, bloqueado por extensão ou sem internet)." };
  }
}

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className="check-list">
      {checks.map((c) => (
        <li key={c.label} className={`check is-${c.result}`}>
          <span className="check-icon" aria-hidden>
            {ICON[c.result]}
          </span>
          <span>
            <strong>{c.label}</strong>
            <span className="sr-only"> — {c.result === "ok" ? "ok" : c.result === "warn" ? "atenção" : "falhou"}</span>
            <br />
            {c.detail}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BrowserCheck() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  useEffect(() => setChecks(browserChecks()), []);
  if (!checks) return <p className="empty-note">Testando o seu navegador...</p>;
  return <CheckList checks={checks} />;
}

export function ServiceStatus() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [running, setRunning] = useState(false);

  // Só roda quando você pede: os testes falam com o YouTube e o Open-Meteo, como o próprio app faria.
  const run = async () => {
    setRunning(true);
    setChecks(
      await Promise.all([
        probe("coffe to relax", "/api/status"),
        probe("YouTube (títulos da playlist)", "https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DjfKfPfyJRdk&format=json"),
        probe("Open-Meteo (clima)", "https://api.open-meteo.com/v1/forecast?latitude=-23.55&longitude=-46.63&current_weather=true"),
      ]),
    );
    setRunning(false);
  };

  return (
    <>
      {checks && <CheckList checks={checks} />}
      <button className="btn btn-solid" onClick={run} disabled={running}>
        {running ? "verificando..." : checks ? "verificar de novo" : "verificar agora"}
      </button>
    </>
  );
}
