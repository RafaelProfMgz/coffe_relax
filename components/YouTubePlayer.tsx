"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SoundButton from "@/components/ui/SoundButton";
import { useSound } from "@/hooks/useSound";
import { useYouTubeLibrary, thumbnailFor, extractVideoId, type Track } from "@/hooks/useYouTubeLibrary";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube-api";

type RepeatMode = "off" | "all" | "one";

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
};

export default function YouTubePlayer() {
  const { tracks, hydrated, add, remove, rename, move } = useYouTubeLibrary();
  const sound = useSound();

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("all");
  const [ytVolume, setYtVolume] = useState(70);
  const [showVideo, setShowVideo] = useState(true);
  const [filter, setFilter] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [apiReady, setApiReady] = useState(false);

  const current = useMemo(() => tracks.find((t) => t.id === currentId) ?? null, [tracks, currentId]);
  const currentIndex = useMemo(() => tracks.findIndex((t) => t.id === currentId), [tracks, currentId]);

  // refs para o callback de "vídeo terminou", que vive fora do ciclo do React
  const stateRef = useRef({ tracks, currentIndex, shuffle, repeat });
  stateRef.current = { tracks, currentIndex, shuffle, repeat };

  const pickNext = useCallback((step: 1 | -1) => {
    const { tracks: list, currentIndex: idx, shuffle: sh, repeat: rp } = stateRef.current;
    if (list.length === 0) return null;
    if (sh && list.length > 1) {
      let next = idx;
      while (next === idx) next = Math.floor(Math.random() * list.length);
      return list[next];
    }
    const nextIdx = idx + step;
    if (nextIdx < 0) return rp === "all" ? list[list.length - 1] : null;
    if (nextIdx >= list.length) return rp === "all" ? list[0] : null;
    return list[nextIdx];
  }, []);

  // ── monta o player uma vez
  useEffect(() => {
    let disposed = false;
    loadYouTubeApi()
      .then((YT) => {
        if (disposed || !hostRef.current) return;
        playerRef.current = new YT.Player(hostRef.current, {
          height: "100%",
          width: "100%",
          // youtube-nocookie: não grava cookies de rastreamento antes da reprodução
          host: "https://www.youtube-nocookie.com",
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => {
              if (disposed) return;
              playerRef.current?.setVolume(ytVolume);
              setApiReady(true);
            },
            onStateChange: (e: { data: number }) => {
              if (disposed) return;
              if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
              if (e.data === YT.PlayerState.PAUSED) setPlaying(false);
              if (e.data === YT.PlayerState.ENDED) {
                const { repeat: rp } = stateRef.current;
                if (rp === "one") {
                  playerRef.current?.seekTo(0, true);
                  playerRef.current?.playVideo();
                  return;
                }
                const next = pickNext(1);
                if (next) setCurrentId(next.id);
                else setPlaying(false);
              }
            },
          },
        });
      })
      .catch(() => setStatus({ kind: "err", text: "Não consegui carregar o player do YouTube." }));

    return () => {
      disposed = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* já destruído */
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── troca de faixa
  useEffect(() => {
    if (!apiReady || !current) return;
    playerRef.current?.loadVideoById(current.videoId);
    setPosition(0);
    setDuration(0);
  }, [apiReady, current]);

  // ── volume do YouTube
  useEffect(() => {
    if (apiReady) playerRef.current?.setVolume(ytVolume);
  }, [apiReady, ytVolume]);

  // ── barra de progresso
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      setPosition(p.getCurrentTime());
      setDuration(p.getDuration());
    }, 500);
    return () => window.clearInterval(id);
  }, [playing]);

  // ── mensagens somem sozinhas
  useEffect(() => {
    if (!status) return;
    const id = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(id);
  }, [status]);

  const play = useCallback((track: Track) => {
    setCurrentId(track.id);
    window.setTimeout(() => playerRef.current?.playVideo(), 120);
  }, []);

  const togglePlay = useCallback(() => {
    if (!current) {
      const first = tracks[0];
      if (first) play(first);
      return;
    }
    if (playing) playerRef.current?.pauseVideo();
    else playerRef.current?.playVideo();
  }, [current, playing, tracks, play]);

  const skip = useCallback(
    (step: 1 | -1) => {
      const next = pickNext(step);
      if (next) play(next);
    },
    [pickNext, play]
  );

  const handleAdd = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const result = await add(url, title);
    setSaving(false);
    if (result.ok) {
      sound.confirm();
      setStatus({ kind: "ok", text: `“${result.track.title}” salvo na biblioteca.` });
      setUrl("");
      setTitle("");
    } else {
      sound.reject();
      setStatus({ kind: "err", text: result.error });
    }
  }, [add, url, title, saving, sound]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tracks, filter]);

  const previewId = extractVideoId(url);

  return (
    <section className="panel player-panel" aria-label="Player de músicas e vídeos do YouTube">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Minha Playlist</h2>
          <p className="panel-sub">
            Cole um link do YouTube — o link e o título ficam salvos no seu navegador.
          </p>
        </div>
        <span className="badge">{tracks.length} {tracks.length === 1 ? "faixa" : "faixas"}</span>
      </header>

      {/* ── Palco ─────────────────────────────────────────────── */}
      <div className={`stage ${showVideo ? "" : "stage-audio"}`}>
        <div className="stage-frame">
          <div ref={hostRef} className="stage-player" />
          {!current && (
            <div className="stage-empty">
              <span className="stage-empty-icon">☕</span>
              <p>Nada tocando ainda.</p>
              <small>Salve um link abaixo e escolha uma faixa.</small>
            </div>
          )}
        </div>
      </div>

      {/* ── Agora tocando + controles ──────────────────────────── */}
      <div className="now-playing">
        <div className="now-meta">
          <span className="now-label">{playing ? "tocando agora" : current ? "pausado" : "silêncio"}</span>
          <strong className="now-title" title={current?.title}>
            {current?.title ?? "—"}
          </strong>
        </div>

        <div className="seek-row">
          <span className="time">{fmt(position)}</span>
          <input
            className="seek"
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={1}
            value={Math.min(position, duration || 0)}
            disabled={!current}
            aria-label="Posição da faixa"
            onChange={(e) => {
              const v = Number(e.target.value);
              setPosition(v);
              playerRef.current?.seekTo(v, true);
            }}
          />
          <span className="time">{fmt(duration)}</span>
        </div>

        <div className="controls">
          <SoundButton
            variant="icon"
            aria-label="Faixa anterior"
            title="Anterior"
            disabled={tracks.length === 0}
            onClick={() => skip(-1)}
          >
            ⏮
          </SoundButton>

          <SoundButton
            variant="solid"
            className="play-btn"
            aria-label={playing ? "Pausar" : "Tocar"}
            title={playing ? "Pausar" : "Tocar"}
            disabled={tracks.length === 0}
            onClick={togglePlay}
          >
            {playing ? "❚❚" : "▶"}
          </SoundButton>

          <SoundButton
            variant="icon"
            aria-label="Próxima faixa"
            title="Pular"
            disabled={tracks.length === 0}
            onClick={() => skip(1)}
          >
            ⏭
          </SoundButton>

          <SoundButton
            variant="pill"
            active={shuffle}
            aria-pressed={shuffle}
            title="Aleatório"
            onClick={() => {
              sound.toggle(!shuffle);
              setShuffle((s) => !s);
            }}
            sfx="none"
          >
            🔀 aleatório
          </SoundButton>

          <SoundButton
            variant="pill"
            active={repeat !== "off"}
            title="Repetição"
            onClick={() => {
              const order: RepeatMode[] = ["off", "all", "one"];
              const next = order[(order.indexOf(repeat) + 1) % order.length];
              sound.toggle(next !== "off");
              setRepeat(next);
            }}
            sfx="none"
          >
            {repeat === "one" ? "🔂 uma" : repeat === "all" ? "🔁 tudo" : "🔁 off"}
          </SoundButton>

          <SoundButton
            variant="pill"
            active={showVideo}
            title="Mostrar ou esconder o vídeo"
            onClick={() => {
              sound.toggle(!showVideo);
              setShowVideo((v) => !v);
            }}
            sfx="none"
          >
            {showVideo ? "🎬 vídeo" : "🎧 só áudio"}
          </SoundButton>

          <label className="vol-inline" title="Volume do YouTube">
            <span aria-hidden>🔊</span>
            <input
              type="range"
              min={0}
              max={100}
              value={ytVolume}
              aria-label="Volume do YouTube"
              onChange={(e) => setYtVolume(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* ── Salvar nova faixa ──────────────────────────────────── */}
      <div className="add-row">
        <div className="add-fields">
          <input
            className="field"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            aria-label="Link do vídeo no YouTube"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <input
            className="field"
            placeholder="Título (opcional — buscamos sozinho)"
            value={title}
            aria-label="Título da faixa"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
        </div>
        <SoundButton variant="solid" sfx="none" onClick={handleAdd} disabled={saving || !url.trim()}>
          {saving ? "salvando..." : "+ salvar"}
        </SoundButton>
      </div>

      {previewId && (
        <div className="add-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailFor(previewId)} alt="" />
          <span>Link reconhecido — id {previewId}</span>
        </div>
      )}

      {status && <p className={`status status-${status.kind}`}>{status.text}</p>}

      {/* ── Playlist ───────────────────────────────────────────── */}
      <div className="playlist-head">
        <h3>Faixas salvas</h3>
        {tracks.length > 3 && (
          <input
            className="field field-sm"
            placeholder="filtrar..."
            value={filter}
            aria-label="Filtrar faixas"
            onChange={(e) => setFilter(e.target.value)}
          />
        )}
      </div>

      {hydrated && tracks.length === 0 && (
        <p className="empty-note">
          Sua biblioteca está vazia. Cole o link de uma playlist lo-fi, de um vídeo de chuva ou daquela
          música que te acalma — ela fica salva aqui mesmo, no seu navegador.
        </p>
      )}

      <ul className="playlist">
        {visible.map((t, i) => {
          const isCurrent = t.id === currentId;
          return (
            <li key={t.id} className={`track ${isCurrent ? "is-current" : ""}`}>
              <button
                className="track-main"
                onClick={() => {
                  sound.click();
                  play(t);
                }}
                onMouseEnter={sound.hover}
                aria-label={`Tocar ${t.title}`}
              >
                <span className="track-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnailFor(t.videoId)} alt="" loading="lazy" />
                  <span className="track-thumb-badge">{isCurrent && playing ? "❚❚" : "▶"}</span>
                </span>
                <span className="track-text">
                  {editingId === t.id ? (
                    <input
                      className="field field-sm"
                      value={editValue}
                      autoFocus
                      aria-label="Novo título"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        rename(t.id, editValue);
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          rename(t.id, editValue);
                          setEditingId(null);
                          sound.confirm();
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <span className="track-title">{t.title}</span>
                  )}
                  <span className="track-url">{t.url}</span>
                </span>
              </button>

              <div className="track-actions">
                <SoundButton
                  variant="icon"
                  title="Subir na lista"
                  aria-label={`Subir ${t.title}`}
                  disabled={i === 0 || filter !== ""}
                  onClick={() => move(t.id, -1)}
                >
                  ↑
                </SoundButton>
                <SoundButton
                  variant="icon"
                  title="Descer na lista"
                  aria-label={`Descer ${t.title}`}
                  disabled={i === visible.length - 1 || filter !== ""}
                  onClick={() => move(t.id, 1)}
                >
                  ↓
                </SoundButton>
                <SoundButton
                  variant="icon"
                  title="Renomear"
                  aria-label={`Renomear ${t.title}`}
                  onClick={() => {
                    setEditingId(t.id);
                    setEditValue(t.title);
                  }}
                >
                  ✎
                </SoundButton>
                <SoundButton
                  variant="danger"
                  sfx="reject"
                  title="Remover da biblioteca"
                  aria-label={`Remover ${t.title}`}
                  onClick={() => {
                    if (t.id === currentId) {
                      playerRef.current?.stopVideo();
                      setCurrentId(null);
                      setPlaying(false);
                    }
                    remove(t.id);
                  }}
                >
                  ✕
                </SoundButton>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
