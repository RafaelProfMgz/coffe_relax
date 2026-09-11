"use client";

import SoundButton from "@/components/ui/SoundButton";
import { useSound } from "@/hooks/useSound";

export default function Topbar({
  mode,
  focus,
  onFocusToggle,
}: {
  mode: string;
  focus: boolean;
  onFocusToggle: () => void;
}) {
  const sound = useSound();

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden>
          ☕
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 className="brand-name">coffe to relax</h1>
          <div className="brand-sub">~/.relax/cafe.rc — ambiente de foco</div>
        </div>
      </div>

      <div className="topbar-actions">
        <span className={`mode-chip ${mode !== "VISUAL" ? "is-hot" : ""}`}>-- {mode} --</span>

        <SoundButton variant="pill" active={focus} sfx="none" onClick={onFocusToggle} title="Alternar modo foco">
          {focus ? "🌙 noite" : "☀ dia"}
        </SoundButton>

        <div className="vol-group">
          <SoundButton
            variant="icon"
            sfx="none"
            title={sound.muted ? "Reativar som" : "Silenciar"}
            aria-label={sound.muted ? "Reativar som" : "Silenciar"}
            onClick={() => {
              const next = !sound.muted;
              // toca o som antes de mutar, para ter retorno audível
              if (next) sound.toggle(false);
              sound.setMuted(next);
              if (!next) window.setTimeout(() => sound.toggle(true), 60);
            }}
          >
            {sound.muted ? "🔇" : "🔊"}
          </SoundButton>
          <input
            type="range"
            min={0}
            max={100}
            value={sound.volume}
            aria-label="Volume geral"
            style={{ width: 92 }}
            onChange={(e) => sound.setVolume(Number(e.target.value))}
          />
          <span>{sound.muted ? "off" : `${sound.volume}%`}</span>
        </div>
      </div>
    </header>
  );
}
