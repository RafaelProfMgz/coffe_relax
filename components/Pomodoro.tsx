"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SoundButton from "@/components/ui/SoundButton";
import { useSound } from "@/hooks/useSound";

const FOCUS = 25 * 60;
const BREAK = 5 * 60;

export default function Pomodoro() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const sound = useSound();
  const soundRef = useRef(sound);
  soundRef.current = sound;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Virada de ciclo: toca a tigela e já engata o próximo bloco
  useEffect(() => {
    if (timeLeft !== 0 || !running) return;
    soundRef.current.chime();
    setRunning(false);
    setMode((m) => {
      const next = m === "focus" ? "break" : "focus";
      setTimeLeft(next === "focus" ? FOCUS : BREAK);
      return next;
    });
    if (mode === "focus") setCycles((c) => c + 1);
  }, [timeLeft, running, mode]);

  const reset = useCallback(() => {
    setRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS : BREAK);
  }, [mode]);

  const switchMode = useCallback(() => {
    const next = mode === "focus" ? "break" : "focus";
    setMode(next);
    setTimeLeft(next === "focus" ? FOCUS : BREAK);
    setRunning(false);
  }, [mode]);

  const total = mode === "focus" ? FOCUS : BREAK;
  const progress = 1 - timeLeft / total;
  const R = 52;
  const C = 2 * Math.PI * R;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <section className="panel" aria-label="Timer pomodoro">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Pomodoro</h2>
          <p className="panel-sub">{mode === "focus" ? "Bloco de foco de 25 minutos." : "Pausa de 5 minutos."}</p>
        </div>
        <span className="badge">{cycles} ciclos</span>
      </header>

      <div className="ring-wrap">
        <svg width={124} height={124} aria-hidden>
          <circle className="ring-bg" cx={62} cy={62} r={R} fill="none" strokeWidth={7} />
          <circle
            className="ring-fg"
            cx={62}
            cy={62}
            r={R}
            fill="none"
            strokeWidth={7}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ stroke: mode === "break" ? "var(--green)" : "var(--accent)" }}
          />
        </svg>
        <div className="ring-label">
          <span className="stat-value" style={{ fontSize: "2rem", margin: 0, color: mode === "break" ? "var(--green)" : "var(--accent)" }}>
            {mm}:{ss}
          </span>
          <span className="stat-caption">{mode === "focus" ? "foco" : "pausa"}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <SoundButton variant="solid" sfx="none" onClick={() => { sound.toggle(!running); setRunning((r) => !r); }}>
          {running ? "pausar" : "iniciar"}
        </SoundButton>
        <SoundButton variant="ghost" onClick={reset}>
          zerar
        </SoundButton>
        <SoundButton variant="ghost" onClick={switchMode} title="Trocar entre foco e pausa">
          {mode === "focus" ? "→ pausa" : "→ foco"}
        </SoundButton>
      </div>
    </section>
  );
}
