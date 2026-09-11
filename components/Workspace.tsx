"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import StartOverlay from "@/components/StartOverlay";
import Topbar from "@/components/Topbar";
import Keypad, { KEYS, type KeyDef } from "@/components/Keypad";
import TerminalLog from "@/components/TerminalLog";
import SmartNotes from "@/components/SmartNotes";
import Pomodoro from "@/components/Pomodoro";
import WeatherCard from "@/components/WeatherCard";
import AmbienceMixer from "@/components/AmbienceMixer";
import PublicLibraries from "@/components/PublicLibraries";
import YouTubePlayer from "@/components/YouTubePlayer";
import { useSound } from "@/hooks/useSound";
import { useConsent } from "@/hooks/useConsent";
import { store } from "@/lib/storage";
import SiteFooter from "@/components/SiteFooter";

const THEME_KEY = "coffe_focus";

export default function Workspace() {
  const sound = useSound();
  const [log, setLog] = useState("aguardando input...");
  const [mode, setMode] = useState("VISUAL");
  const [focus, setFocus] = useState(false);
  const [downKey, setDownKey] = useState<string | null>(null);
  const modeTimer = useRef<number | null>(null);
  const { ready: consentReady, allowPreferences } = useConsent();
  const [themeLoaded, setThemeLoaded] = useState(false);

  // tema persistido — só depois do consentimento de preferências
  useEffect(() => {
    if (!consentReady) return;
    if (allowPreferences && store.get(THEME_KEY) === "1") setFocus(true);
    setThemeLoaded(true);
  }, [consentReady, allowPreferences]);

  useEffect(() => {
    document.documentElement.dataset.theme = focus ? "dark" : "light";
    if (themeLoaded) store.set(THEME_KEY, focus ? "1" : "0");
  }, [focus, themeLoaded]);

  const flashMode = useCallback((label: string) => {
    setMode(label);
    if (modeTimer.current) window.clearTimeout(modeTimer.current);
    modeTimer.current = window.setTimeout(() => setMode("VISUAL"), 700);
  }, []);

  const handleStart = useCallback(async () => {
    await sound.awaken();
    setLog("grãos moídos • áudio pronto • bom foco");
  }, [sound]);

  const playKey = useCallback(
    (k: KeyDef) => {
      sound.note(k.index);
      setLog(`tecla ${k.label} → ${k.hint}`);
      flashMode("INSERT");
      setDownKey(k.label);
      window.setTimeout(() => setDownKey((c) => (c === k.label ? null : c)), 140);
    },
    [sound, flashMode]
  );

  // Atalhos estilo vim — ignorados quando o foco está em um campo de texto
  useEffect(() => {
    if (!sound.ready) return;
    const map: Record<string, KeyDef> = {
      h: KEYS[0], j: KEYS[1], k: KEYS[2], l: KEYS[3], w: KEYS[4], b: KEYS[5], " ": KEYS[6],
    };
    const handler = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const def = map[e.key.toLowerCase()];
      if (!def) return;
      e.preventDefault();
      playKey(def);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sound.ready, playKey]);

  return (
    <>
      <StartOverlay onStart={handleStart} />
      <Topbar mode={mode} focus={focus} onFocusToggle={() => { sound.toggle(!focus); setFocus((f) => !f); }} />

      <div className="shell">
        <div className="grid">
          <div className="col">
            <YouTubePlayer />
            <AmbienceMixer />

            <section className="panel" aria-label="Teclado de notas">
              <header className="panel-head">
                <div>
                  <h2 className="panel-title">Teclado do Café</h2>
                  <p className="panel-sub">Teclas mecânicas afinadas — clique ou use o teclado.</p>
                </div>
              </header>
              <Keypad onPlay={playKey} downKey={downKey} />
              <TerminalLog text={log} />
            </section>
          </div>

          <div className="col">
            <Pomodoro />
            <WeatherCard />
            <PublicLibraries />
          </div>
        </div>

        <section className="panel" style={{ marginTop: 22 }} aria-label="Mural de notas">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Mural de Notas</h2>
              <p className="panel-sub">Arraste, pinte e escreva. Fica salvo no seu navegador.</p>
            </div>
          </header>
          <SmartNotes />
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
