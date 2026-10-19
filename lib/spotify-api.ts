"use client";

/**
 * Tipagem mínima do que usamos da Spotify iFrame API.
 * O player oficial não expõe volume nem pular faixa — só tocar, pausar e buscar.
 */
export interface SpotifyPlaybackUpdate {
  isPaused: boolean;
  isBuffering: boolean;
  /** em milissegundos */
  duration: number;
  /** em milissegundos */
  position: number;
}

export interface SpotifyController {
  loadUri(uri: string): void;
  play(): void;
  pause(): void;
  resume(): void;
  togglePlay(): void;
  seek(seconds: number): void;
  destroy(): void;
  addListener(event: "ready", cb: () => void): void;
  addListener(event: "playback_update", cb: (e: { data: SpotifyPlaybackUpdate }) => void): void;
}

export interface SpotifyIFrameAPI {
  createController(
    el: HTMLElement,
    opts: { uri: string; width?: string | number; height?: string | number },
    cb: (controller: SpotifyController) => void
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

let pending: Promise<SpotifyIFrameAPI> | null = null;

/** Carrega (uma única vez) o script oficial — só quando um item do Spotify entra num canal. */
export function loadSpotifyApi(): Promise<SpotifyIFrameAPI> {
  if (typeof window === "undefined") return Promise.reject(new Error("sem window"));
  if (pending) return pending;

  pending = new Promise<SpotifyIFrameAPI>((resolve, reject) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      pending = null;
      reject(new Error("falha ao carregar a API do Spotify"));
    };
    document.head.appendChild(script);
  });

  return pending;
}
