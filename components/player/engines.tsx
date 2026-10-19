"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { MediaItem, Progress } from "@/hooks/useMediaLibrary";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube-api";
import { loadSpotifyApi, type SpotifyController } from "@/lib/spotify-api";

/** O que o canal consegue pedir a qualquer motor. */
export interface EngineHandle {
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  restart(): void;
  /** só playlists do YouTube navegam por dentro; os outros seguem a biblioteca */
  next?(): void;
  prev?(): void;
}

export interface EngineState {
  ready: boolean;
  playing: boolean;
  position: number;
  duration: number;
  /** título do vídeo atual dentro de uma playlist */
  subtitle?: string;
  index?: number;
  count?: number;
  error?: string;
}

export interface EngineProps {
  item: MediaItem;
  volume: number;
  rate: number;
  /** ponto salvo de onde retomar (só chega para itens longos) */
  resume?: Progress;
  onState: (patch: Partial<EngineState>) => void;
  onEnded: () => void;
}

/* ─────────────────────────────────────────── YouTube (vídeo e playlist) */

export const YouTubeEngine = forwardRef<EngineHandle, EngineProps>(function YouTubeEngine(
  { item, volume, rate, resume, onState, onEnded },
  ref
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const isList = item.kind === "youtube-playlist";
  // callbacks mudam a cada render; o player vive fora do ciclo do React
  const cb = useRef({ onState, onEnded, volume, rate });
  cb.current = { onState, onEnded, volume, rate };

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    seek: (s) => playerRef.current?.seekTo(s, true),
    restart: () => {
      const p = playerRef.current;
      if (!p) return;
      if (isList) p.loadPlaylist({ list: item.ref, listType: "playlist", index: 0 });
      else {
        p.seekTo(0, true);
        p.playVideo();
      }
    },
    ...(isList && {
      next: () => playerRef.current?.nextVideo(),
      prev: () => playerRef.current?.previousVideo(),
    }),
  }));

  useEffect(() => {
    let disposed = false;
    let poll: number | null = null;
    const mount = document.createElement("div");
    hostRef.current?.appendChild(mount);

    const sync = () => {
      const p = playerRef.current;
      if (!p || !readyRef.current) return;
      const patch: Partial<EngineState> = { position: p.getCurrentTime(), duration: p.getDuration() };
      if (isList) {
        patch.index = p.getPlaylistIndex();
        patch.count = p.getPlaylist()?.length ?? undefined;
        patch.subtitle = p.getVideoData?.().title || undefined;
      }
      cb.current.onState(patch);
    };

    const startSeconds = resume && resume.t > 5 ? Math.floor(resume.t) : undefined;

    loadYouTubeApi()
      .then((YT) => {
        if (disposed) return;
        const playerVars: Record<string, unknown> = { playsinline: 1, rel: 0, modestbranding: 1 };
        if (!isList && startSeconds) playerVars.start = startSeconds;
        // link com v= e list=: a playlist começa naquele vídeo
        if (isList && !resume && item.startVideoId) {
          playerVars.list = item.ref;
          playerVars.listType = "playlist";
        }

        playerRef.current = new YT.Player(mount, {
          height: "100%",
          width: "100%",
          // youtube-nocookie: não grava cookies de rastreamento antes da reprodução
          host: "https://www.youtube-nocookie.com",
          videoId: isList ? item.startVideoId : item.ref,
          playerVars,
          events: {
            onReady: () => {
              if (disposed) return;
              const p = playerRef.current!;
              readyRef.current = true;
              p.setVolume(cb.current.volume);
              p.setPlaybackRate(cb.current.rate);
              if (isList && (resume || !item.startVideoId)) {
                p.cuePlaylist({ list: item.ref, listType: "playlist", index: resume?.index ?? 0, startSeconds });
              }
              cb.current.onState({ ready: true });
              sync();
            },
            onStateChange: (e: { data: number }) => {
              if (disposed) return;
              const playing = e.data === YT.PlayerState.PLAYING;
              cb.current.onState({ playing });
              if (playing) {
                // a velocidade volta a 1× quando o vídeo troca
                playerRef.current?.setPlaybackRate(cb.current.rate);
                if (!poll) poll = window.setInterval(sync, 500);
              } else if (poll) {
                window.clearInterval(poll);
                poll = null;
              }
              sync();
              if (e.data === YT.PlayerState.ENDED) {
                const p = playerRef.current;
                const last = !isList || (p && p.getPlaylistIndex() >= (p.getPlaylist()?.length ?? 1) - 1);
                if (last) cb.current.onEnded();
              }
            },
            onError: () => cb.current.onState({ error: "O YouTube recusou esse vídeo (privado, removido ou sem permissão para tocar fora do site)." }),
          },
        });
      })
      .catch(() => cb.current.onState({ error: "Não consegui carregar o player do YouTube." }));

    return () => {
      disposed = true;
      readyRef.current = false;
      if (poll) window.clearInterval(poll);
      try {
        playerRef.current?.destroy();
      } catch {
        /* já destruído */
      }
      playerRef.current = null;
      mount.remove();
    };
    // o canal remonta o motor quando o item muda (key = item.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (readyRef.current) playerRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (readyRef.current) playerRef.current?.setPlaybackRate(rate);
  }, [rate]);

  return <div ref={hostRef} className="stage-player" />;
});

/* ─────────────────────────────────────────── Spotify */

/** Faixas e episódios cabem no player compacto; listas precisam da altura maior. */
const spotifyHeight = (type?: string) => (type === "track" || type === "episode" || type === "chapter" ? 152 : 352);

export const SpotifyEngine = forwardRef<EngineHandle, EngineProps>(function SpotifyEngine(
  { item, resume, onState },
  ref
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ctrlRef = useRef<SpotifyController | null>(null);
  const started = useRef(false);
  // o Spotify só aceita buscar depois que a reprodução começa
  const pendingSeek = useRef(resume && resume.t > 5 ? resume.t : 0);
  const cb = useRef(onState);
  cb.current = onState;

  useImperativeHandle(ref, () => ({
    play: () => {
      const c = ctrlRef.current;
      if (!c) return;
      if (started.current) c.resume();
      else c.play();
      started.current = true;
    },
    pause: () => ctrlRef.current?.pause(),
    seek: (s) => ctrlRef.current?.seek(s),
    restart: () => {
      ctrlRef.current?.seek(0);
      ctrlRef.current?.resume();
    },
  }));

  useEffect(() => {
    let disposed = false;
    const mount = document.createElement("div");
    hostRef.current?.appendChild(mount);

    loadSpotifyApi()
      .then((api) => {
        if (disposed) return;
        api.createController(mount, { uri: item.ref, width: "100%", height: spotifyHeight(item.spotifyType) }, (c) => {
          if (disposed) {
            c.destroy();
            return;
          }
          ctrlRef.current = c;
          c.addListener("ready", () => cb.current({ ready: true }));
          c.addListener("playback_update", ({ data }) => {
            const playing = !data.isPaused;
            if (playing) started.current = true;
            if (playing && pendingSeek.current && data.position > 0) {
              const t = pendingSeek.current;
              pendingSeek.current = 0;
              c.seek(t);
            }
            cb.current({ playing, position: data.position / 1000, duration: data.duration / 1000 });
          });
        });
      })
      .catch(() => cb.current({ error: "Não consegui carregar o player do Spotify." }));

    return () => {
      disposed = true;
      try {
        ctrlRef.current?.destroy();
      } catch {
        /* já destruído */
      }
      ctrlRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className="spotify-host" style={{ minHeight: spotifyHeight(item.spotifyType) }} />;
});

/* ─────────────────────────────────────────── Áudio direto (link ou arquivo) */

export const AudioEngine = forwardRef<EngineHandle, EngineProps>(function AudioEngine(
  { item, volume, rate, resume, onState, onEnded },
  ref
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resumed = useRef(false);

  useImperativeHandle(ref, () => ({
    play: () => {
      audioRef.current?.play().catch(() => onState({ error: "O navegador não deixou tocar esse áudio." }));
    },
    pause: () => audioRef.current?.pause(),
    seek: (s) => {
      if (audioRef.current) audioRef.current.currentTime = s;
    },
    restart: () => {
      const a = audioRef.current;
      if (!a) return;
      a.currentTime = 0;
      void a.play();
    },
  }));

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  return (
    <audio
      ref={audioRef}
      src={item.ref}
      preload="metadata"
      onLoadedMetadata={(e) => {
        const a = e.currentTarget;
        a.volume = volume / 100;
        a.playbackRate = rate;
        if (!resumed.current && resume && resume.t > 5 && resume.t < a.duration - 15) a.currentTime = resume.t;
        resumed.current = true;
        onState({ ready: true, duration: a.duration, position: a.currentTime });
      }}
      onTimeUpdate={(e) => onState({ position: e.currentTarget.currentTime })}
      onDurationChange={(e) => onState({ duration: e.currentTarget.duration })}
      onPlay={() => onState({ playing: true })}
      onPause={() => onState({ playing: false })}
      onEnded={() => {
        onState({ playing: false });
        onEnded();
      }}
      onError={() =>
        onState({
          error: item.local
            ? "Não consegui abrir esse arquivo — o formato pode não ser suportado pelo navegador."
            : "Não consegui carregar esse áudio — o link pode ter expirado ou bloquear acesso de outros sites.",
        })
      }
    />
  );
});
