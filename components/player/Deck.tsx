"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SoundButton from "@/components/ui/SoundButton";
import { useSound } from "@/hooks/useSound";
import type { Deck as DeckT, MediaItem, Progress, RepeatMode } from "@/hooks/useMediaLibrary";
import { KIND_ICON, KIND_LABEL, fmtTime, spotifyTypeLabel } from "@/lib/media-sources";
import {
  AudioEngine,
  SpotifyEngine,
  YouTubeEngine,
  type EngineHandle,
  type EngineState,
} from "@/components/player/engines";

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75];
const REPEAT_ORDER: RepeatMode[] = ["off", "one", "next"];
const REPEAT_LABEL: Record<RepeatMode, string> = { off: "🔁 off", one: "🔂 repetir", next: "⏭ seguir" };
const REPEAT_TITLE: Record<RepeatMode, string> = {
  off: "Para quando terminar",
  one: "Repete o item (ou a playlist inteira)",
  next: "Segue para o próximo da biblioteca",
};
/** A partir daqui o item é tratado como longo (audiobook, podcast, mix) e guarda onde parou. */
const LONG_ITEM = 600;

const EMPTY: EngineState = { ready: false, playing: false, position: 0, duration: 0 };

interface Props {
  deck: DeckT;
  item: MediaItem | null;
  items: MediaItem[];
  /** muda a cada pedido de "tocar" vindo de fora (biblioteca, seguir para o próximo) */
  playRequest: number;
  canRemove: boolean;
  onUpdate: (patch: Partial<DeckT>) => void;
  onPlayItem: (itemId: string) => void;
  onRemove: () => void;
  getProgress: (itemId: string) => Progress | undefined;
  saveProgress: (itemId: string, p: Omit<Progress, "at"> | null) => void;
}

export default function Deck({
  deck,
  item,
  items,
  playRequest,
  canRemove,
  onUpdate,
  onPlayItem,
  onRemove,
  getProgress,
  saveProgress,
}: Props) {
  const sound = useSound();
  const engineRef = useRef<EngineHandle | null>(null);
  const [state, setState] = useState<EngineState>(EMPTY);
  const [resume, setResume] = useState<Progress | undefined>(undefined);
  const wantPlay = useRef(false);
  const seeking = useRef(false);

  const isSpotify = item?.kind === "spotify";
  const isYouTube = item?.kind === "youtube" || item?.kind === "youtube-playlist";
  const isList = item?.kind === "youtube-playlist";

  const itemId = item?.id ?? null;
  const stateRef = useRef<EngineState>(EMPTY);

  // novo item: zera o estado e lê o ponto salvo uma única vez (renomear não conta)
  useEffect(() => {
    stateRef.current = EMPTY;
    setState(EMPTY);
    setResume(itemId ? getProgress(itemId) : undefined);
  }, [itemId, getProgress]);

  // pedidos de "tocar" chegam antes ou depois de o motor ficar pronto
  useEffect(() => {
    if (!playRequest) return;
    if (state.ready) engineRef.current?.play();
    else wantPlay.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playRequest]);

  useEffect(() => {
    if (state.ready && wantPlay.current) {
      wantPlay.current = false;
      engineRef.current?.play();
    }
  }, [state.ready]);

  const neighbor = useCallback(
    (step: 1 | -1) => {
      if (!item) return null;
      const idx = items.findIndex((i) => i.id === item.id);
      return items[idx + step] ?? null;
    },
    [items, item]
  );

  const onState = useCallback(
    (patch: Partial<EngineState>) => {
      const prev = stateRef.current;
      const next = { ...prev, ...patch };
      // enquanto o usuário arrasta a barra, o motor não puxa a posição de volta
      if (seeking.current && patch.position !== undefined) next.position = prev.position;
      stateRef.current = next;
      setState(next);
      if (itemId && patch.position !== undefined && next.duration > 0 && (isList || next.duration >= LONG_ITEM)) {
        const nearEnd = next.position > next.duration - 15;
        saveProgress(itemId, nearEnd && !isList ? null : { t: next.position, index: next.index });
      }
    },
    [itemId, isList, saveProgress]
  );

  const onEnded = useCallback(() => {
    if (!item) return;
    saveProgress(item.id, null);
    if (deck.repeat === "one") engineRef.current?.restart();
    else if (deck.repeat === "next") {
      const next = neighbor(1);
      if (next) onPlayItem(next.id);
    }
  }, [item, deck.repeat, neighbor, onPlayItem, saveProgress]);

  const skip = (step: 1 | -1) => {
    const engine = engineRef.current;
    if (isList && engine) {
      if (step === 1) engine.next?.();
      else engine.prev?.();
      return;
    }
    const target = neighbor(step);
    if (target) onPlayItem(target.id);
  };

  const togglePlay = () => {
    if (state.playing) engineRef.current?.pause();
    else engineRef.current?.play();
  };

  const engineProps = item && {
    item,
    volume: deck.volume,
    rate: deck.rate,
    resume,
    onState,
    onEnded,
    ref: engineRef,
  };

  const status = state.playing ? "tocando" : state.ready ? "pausado" : item ? "carregando…" : "livre";
  const resumedAt = resume && resume.t > 5 ? resume.t : 0;

  return (
    <article className={`deck ${state.playing ? "is-playing" : ""}`} aria-label={`Canal ${deck.label}`}>
      <header className="deck-head">
        <span className={`deck-dot ${state.playing ? "is-on" : ""}`} aria-hidden />
        <input
          className="deck-label"
          value={deck.label}
          maxLength={24}
          aria-label="Nome do canal"
          onChange={(e) => onUpdate({ label: e.target.value })}
          onBlur={(e) => !e.target.value.trim() && onUpdate({ label: "Canal" })}
        />
        <span className="deck-status">{status}</span>
        {canRemove && (
          <SoundButton variant="icon" sfx="reject" title="Fechar canal" aria-label={`Fechar o canal ${deck.label}`} onClick={onRemove}>
            ✕
          </SoundButton>
        )}
      </header>

      {/* ── Palco ─────────────────────────────────────────────── */}
      <div className={`stage ${isYouTube && !deck.showVideo ? "stage-audio" : ""} ${isSpotify ? "stage-spotify" : ""} ${item?.kind === "audio" ? "stage-file" : ""}`}>
        <div className="stage-frame">
          {item?.kind === "youtube" || item?.kind === "youtube-playlist" ? (
            <YouTubeEngine key={item.id} {...engineProps!} />
          ) : item?.kind === "spotify" ? (
            <SpotifyEngine key={item.id} {...engineProps!} />
          ) : item?.kind === "audio" ? (
            <>
              <AudioEngine key={item.id} {...engineProps!} />
              <div className="stage-file-art" aria-hidden>
                <span className={state.playing ? "is-spinning" : ""}>🎧</span>
              </div>
            </>
          ) : (
            <div className="stage-empty">
              <span className="stage-empty-icon">☕</span>
              <p>Canal livre.</p>
              <small>Escolha algo da biblioteca para tocar aqui.</small>
            </div>
          )}
        </div>
      </div>

      {!item && items.length > 0 && (
        <select
          className="field deck-pick"
          value=""
          aria-label={`Escolher o que tocar no canal ${deck.label}`}
          onChange={(e) => e.target.value && onPlayItem(e.target.value)}
        >
          <option value="">escolher da biblioteca…</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {KIND_ICON[i.kind]} {i.title}
            </option>
          ))}
        </select>
      )}

      {item && (
        <div className="now-playing">
          <div className="now-meta">
            <span className="now-label">
              {KIND_LABEL[item.kind]}
              {isSpotify && ` · ${spotifyTypeLabel(item.spotifyType)}`}
              {isList && state.count ? ` · ${(state.index ?? 0) + 1} de ${state.count}` : ""}
            </span>
            <strong className="now-title" title={item.title}>
              {item.title}
            </strong>
            {state.subtitle && state.subtitle !== item.title && <span className="now-sub">{state.subtitle}</span>}
          </div>

          {state.error && <p className="status status-err">{state.error}</p>}

          {resumedAt > 0 && !state.playing && state.position < resumedAt + 2 && (
            <p className="deck-resume">
              Retomando de {fmtTime(resumedAt)}
              {isList && resume?.index !== undefined ? ` (vídeo ${resume.index + 1})` : ""} ·{" "}
              <button
                className="link-btn"
                onClick={() => {
                  saveProgress(item.id, null);
                  setResume(undefined);
                  engineRef.current?.restart();
                }}
              >
                começar do início
              </button>
            </p>
          )}

          <div className="seek-row">
            <span className="time">{fmtTime(state.position)}</span>
            <input
              className="seek"
              type="range"
              min={0}
              max={Math.max(state.duration, 1)}
              step={1}
              value={Math.min(state.position, state.duration || 0)}
              disabled={!state.ready || state.duration <= 0}
              aria-label={`Posição no canal ${deck.label}`}
              aria-valuetext={`${fmtTime(state.position)} de ${fmtTime(state.duration)}`}
              onPointerDown={() => (seeking.current = true)}
              onPointerUp={() => (seeking.current = false)}
              onChange={(e) => {
                const v = Number(e.target.value);
                stateRef.current = { ...stateRef.current, position: v };
                setState(stateRef.current);
                engineRef.current?.seek(v);
              }}
            />
            <span className="time">{fmtTime(state.duration)}</span>
          </div>

          <div className="controls">
            <SoundButton
              variant="icon"
              aria-label={isList ? "Vídeo anterior da playlist" : "Item anterior da biblioteca"}
              title={isList ? "Vídeo anterior" : "Anterior da biblioteca"}
              disabled={!isList && !neighbor(-1)}
              onClick={() => skip(-1)}
            >
              ⏮
            </SoundButton>
            <SoundButton
              variant="solid"
              className="play-btn"
              aria-label={state.playing ? `Pausar ${deck.label}` : `Tocar ${deck.label}`}
              title={state.playing ? "Pausar" : "Tocar"}
              disabled={!state.ready}
              onClick={togglePlay}
            >
              {state.playing ? "❚❚" : "▶"}
            </SoundButton>
            <SoundButton
              variant="icon"
              aria-label={isList ? "Próximo vídeo da playlist" : "Próximo item da biblioteca"}
              title={isList ? "Próximo vídeo" : "Próximo da biblioteca"}
              disabled={!isList && !neighbor(1)}
              onClick={() => skip(1)}
            >
              ⏭
            </SoundButton>

            <SoundButton
              variant="pill"
              sfx="none"
              active={deck.repeat !== "off"}
              title={REPEAT_TITLE[deck.repeat]}
              onClick={() => {
                const next = REPEAT_ORDER[(REPEAT_ORDER.indexOf(deck.repeat) + 1) % REPEAT_ORDER.length];
                sound.toggle(next !== "off");
                onUpdate({ repeat: next });
              }}
            >
              {REPEAT_LABEL[deck.repeat]}
            </SoundButton>

            {!isSpotify && (
              <SoundButton
                variant="pill"
                active={deck.rate !== 1}
                title="Velocidade de reprodução"
                aria-label={`Velocidade ${deck.rate}×`}
                onClick={() => onUpdate({ rate: RATES[(RATES.indexOf(deck.rate) + 1) % RATES.length] ?? 1 })}
              >
                {deck.rate}×
              </SoundButton>
            )}

            {isYouTube && (
              <SoundButton
                variant="pill"
                sfx="none"
                active={deck.showVideo}
                title="Mostrar ou esconder o vídeo"
                onClick={() => {
                  sound.toggle(!deck.showVideo);
                  onUpdate({ showVideo: !deck.showVideo });
                }}
              >
                {deck.showVideo ? "🎬 vídeo" : "🎧 só áudio"}
              </SoundButton>
            )}
          </div>
        </div>
      )}

      <label
        className={`deck-volume ${isSpotify ? "is-disabled" : ""}`}
        title={isSpotify ? "O player do Spotify não deixa o site mudar o volume — use o volume do sistema ou baixe os outros canais" : `Volume do canal ${deck.label}`}
      >
        <span aria-hidden>{deck.volume === 0 ? "🔇" : "🔊"}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={deck.volume}
          disabled={isSpotify}
          aria-label={`Volume do canal ${deck.label}`}
          aria-valuetext={`${deck.label}, ${deck.volume}%`}
          onChange={(e) => onUpdate({ volume: Number(e.target.value) })}
        />
        <span className="deck-volume-value">{isSpotify ? "no Spotify" : `${deck.volume}%`}</span>
      </label>
    </article>
  );
}
