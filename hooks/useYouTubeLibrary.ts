"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConsent } from "@/hooks/useConsent";
import { store } from "@/lib/storage";

export interface Track {
  /** id interno, estável */
  id: string;
  /** id do vídeo no YouTube */
  videoId: string;
  /** url original colada pelo usuário */
  url: string;
  title: string;
  addedAt: number;
}

const KEY = "coffe_yt_library_v2";
const LEGACY_KEY = "coffe_yt_library";

/** Aceita watch?v=, youtu.be, /embed/, /shorts/, /live/ e o id cru. */
export function extractVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const marker = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live" || p === "v");
      if (marker !== -1 && parts[marker + 1]) {
        const id = parts[marker + 1];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    /* não é uma URL */
  }
  return null;
}

export function thumbnailFor(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Busca o título real no endpoint oEmbed público do YouTube (permite CORS).
 * Se falhar, o chamador usa o título digitado ou um genérico.
 */
export async function fetchTitle(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
    );
    if (!res.ok) return null;
    const json: { title?: string } = await res.json();
    return json.title ?? null;
  } catch {
    return null;
  }
}

function load(): Track[] {
  try {
    const raw = store.get(KEY);
    if (raw) return JSON.parse(raw) as Track[];

    // migração da versão antiga ({id, url, title})
    const legacy = store.get(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy) as Array<{ id: string; url: string; title: string }>;
      const migrated = old
        .map((item) => {
          const videoId = extractVideoId(item.url);
          if (!videoId) return null;
          return { id: item.id, videoId, url: item.url, title: item.title, addedAt: Date.now() } satisfies Track;
        })
        .filter((t): t is Track => t !== null);
      if (migrated.length) store.set(KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* storage indisponível ou json inválido */
  }
  return [];
}

export function useYouTubeLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // espelho síncrono da lista — `add` precisa checar duplicata antes do await
  const tracksRef = useRef<Track[]>([]);
  tracksRef.current = tracks;

  const { ready: consentReady, allowPreferences } = useConsent();

  useEffect(() => {
    if (!consentReady) return;
    setTracks(allowPreferences ? load() : []);
    setHydrated(true);
  }, [consentReady, allowPreferences]);

  // `store.set` já ignora a escrita quando não há consentimento
  useEffect(() => {
    if (!hydrated) return;
    store.set(KEY, JSON.stringify(tracks));
  }, [tracks, hydrated]);

  /** Salva sempre o link e o título. Retorna a faixa ou o motivo da recusa. */
  const add = useCallback(
    async (url: string, manualTitle?: string): Promise<{ ok: true; track: Track } | { ok: false; error: string }> => {
      const videoId = extractVideoId(url);
      if (!videoId) return { ok: false, error: "Link do YouTube inválido — cole algo como https://youtu.be/..." };

      if (tracksRef.current.some((t) => t.videoId === videoId)) {
        return { ok: false, error: "Essa faixa já está na sua biblioteca." };
      }

      const typed = manualTitle?.trim();
      const fetched = typed ? null : await fetchTitle(videoId);
      const track: Track = {
        id: `${videoId}-${Date.now().toString(36)}`,
        videoId,
        url: url.trim(),
        title: typed || fetched || `Faixa ${videoId}`,
        addedAt: Date.now(),
      };
      setTracks((prev) => (prev.some((t) => t.videoId === videoId) ? prev : [...prev, track]));
      return { ok: true, track };
    },
    []
  );

  const remove = useCallback((id: string) => setTracks((prev) => prev.filter((t) => t.id !== id)), []);

  const rename = useCallback(
    (id: string, title: string) =>
      setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, title: title.trim() || t.title } : t))),
    []
  );

  /** Move a faixa uma posição para cima (-1) ou para baixo (+1). */
  const move = useCallback((id: string, delta: number) => {
    setTracks((prev) => {
      const i = prev.findIndex((t) => t.id === id);
      const j = i + delta;
      if (i === -1 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(i, 1);
      next.splice(j, 0, item);
      return next;
    });
  }, []);

  const clear = useCallback(() => setTracks([]), []);

  return { tracks, hydrated, add, remove, rename, move, clear };
}
