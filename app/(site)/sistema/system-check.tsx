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
    storage = { label: "Armazenamento local", result: "ok", detail: "Disponível para salvar a biblioteca e onde você parou (com o seu aceite)." };
  } catch {
    storage = {
      label: "Armazenamento local",
      result: "warn",
      detail: "Bloqueado (janela anônima ou cookies desativados). O app funciona, mas esquece tudo ao recarregar.",
    };
  }

  // Formatos de áudio direto (links e arquivos do computador) que este navegador consegue tocar.
  const probeAudio = document.createElement("audio");
  const formats = [
    ["mp3", "audio/mpeg"],
    ["m4a", "audio/mp4"],
    ["aac", "audio/aac"],
    ["ogg", "audio/ogg"],
    ["opus", 'audio/ogg; codecs="opus"'],
    ["wav", "audio/wav"],
    ["flac", "audio/flac"],
  ] as const;
  const playable = formats.filter(([, mime]) => probeAudio.canPlayType(mime) !== "").map(([ext]) => ext);
  const missing = formats.map(([ext]) => ext).filter((ext) => !playable.includes(ext));

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
      label: "Áudio direto",
      result: playable.length === 0 ? "fail" : missing.length === 0 ? "ok" : "warn",
      detail:
        playable.length === 0
          ? "Este navegador não toca links nem arquivos de áudio."
          : missing.length === 0
            ? "Toca links e arquivos mp3, m4a, aac, ogg, opus, wav e flac."
            : `Toca ${playable.join(", ")}. Não toca ${missing.join(", ")}.`,
    },
    {
      label: "Conexão",
      result: navigator.onLine ? "ok" : "warn",
      detail: navigator.onLine
        ? "On-line."
        : "Sem internet: os sons ambientes e os arquivos do computador funcionam; YouTube, Spotify e links de áudio, não.",
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

  // Só roda quando você pede: os testes falam com o YouTube e o Spotify, como o próprio app faria.
  const run = async () => {
    setRunning(true);
    setChecks(
      await Promise.all([
        probe("coffe to relax", "/api/status"),
        probe("YouTube (títulos da biblioteca)", "https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DjfKfPfyJRdk&format=json"),
        // O script do player do Spotify não libera CORS: a resposta opaca já basta para saber que ele está no ar.
        probe("Spotify (player embutido)", "https://open.spotify.com/embed/iframe-api/v1", { mode: "no-cors" }),
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
