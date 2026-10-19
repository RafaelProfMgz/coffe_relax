"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConsent } from "@/hooks/useConsent";
import { store } from "@/lib/storage";
import { fetchMeta, parseSource, youTubeThumb, type MediaKind } from "@/lib/media-sources";

export interface MediaItem {
  /** id interno, estável */
  id: string;
  kind: MediaKind;
  /** videoId, playlistId, URI do Spotify ou URL do áudio */
  ref: string;
  /** link original colado pelo usuário (ou o nome do arquivo local) */
  url: string;
  title: string;
  thumb?: string | null;
  startVideoId?: string;
  spotifyType?: string;
  addedAt: number;
  /** arquivo do computador: vive só nesta sessão e não é salvo */
  local?: boolean;
}

export type RepeatMode = "off" | "one" | "next";

export interface Deck {
  id: string;
  label: string;
  itemId: string | null;
  volume: number;
  showVideo: boolean;
  repeat: RepeatMode;
  rate: number;
}

/** Onde o item parou. `index` é a posição dentro de uma playlist do YouTube. */
export interface Progress {
  t: number;
  index?: number;
  at: number;
}

export const MAX_DECKS = 4;

const ITEMS_KEY = "coffe_media_v3";
const DECKS_KEY = "coffe_decks_v1";
const PROGRESS_KEY = "coffe_progress_v1";
const LEGACY_KEY = "coffe_yt_library_v2";

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const newDeck = (label: string): Deck => ({
  id: uid("deck"),
  label,
  itemId: null,
  volume: 70,
  showVideo: true,
  repeat: "off",
  rate: 1,
});

// ids fixos: o estado inicial também é renderizado no servidor
const DEFAULT_DECKS = (): Deck[] => [
  { ...newDeck("Música"), id: "deck-1" },
  { ...newDeck("Audiobook"), id: "deck-2" },
];

function readJson<T>(key: string): T | null {
  try {
    const raw = store.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function loadItems(): MediaItem[] {
  const saved = readJson<MediaItem[]>(ITEMS_KEY);
  if (saved) return saved;

  // migração da biblioteca antiga, que só tinha vídeos do YouTube
  const legacy = readJson<Array<{ id: string; videoId: string; url: string; title: string; addedAt: number }>>(LEGACY_KEY);
  return (legacy ?? []).map((t) => ({
    id: t.id,
    kind: "youtube",
    ref: t.videoId,
    url: t.url,
    title: t.title,
    thumb: youTubeThumb(t.videoId),
    addedAt: t.addedAt,
  }));
}

export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [decks, setDecks] = useState<Deck[]>(DEFAULT_DECKS);
  const [hydrated, setHydrated] = useState(false);
  // espelho síncrono — `addLink` checa duplicata antes do await
  const itemsRef = useRef<MediaItem[]>([]);
  itemsRef.current = items;
  const progressRef = useRef<Record<string, Progress>>({});
  const progressTimer = useRef<number | null>(null);

  const { ready: consentReady, allowPreferences } = useConsent();

  useEffect(() => {
    if (!consentReady) return;
    if (allowPreferences) {
      const loaded = loadItems();
      const ids = new Set(loaded.map((i) => i.id));
      const savedDecks = readJson<Deck[]>(DECKS_KEY);
      setItems(loaded);
      setDecks(
        savedDecks?.length
          ? savedDecks.slice(0, MAX_DECKS).map((d) => ({ ...newDeck(d.label), ...d, itemId: d.itemId && ids.has(d.itemId) ? d.itemId : null }))
          : DEFAULT_DECKS()
      );
      progressRef.current = readJson<Record<string, Progress>>(PROGRESS_KEY) ?? {};
    }
    setHydrated(true);
  }, [consentReady, allowPreferences]);

  // `store.set` já ignora a escrita quando não há consentimento
  useEffect(() => {
    if (!hydrated) return;
    store.set(ITEMS_KEY, JSON.stringify(items.filter((i) => !i.local)));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const persistent = new Set(items.filter((i) => !i.local).map((i) => i.id));
    store.set(DECKS_KEY, JSON.stringify(decks.map((d) => ({ ...d, itemId: d.itemId && persistent.has(d.itemId) ? d.itemId : null }))));
  }, [decks, items, hydrated]);

  const addLink = useCallback(
    async (url: string, manualTitle?: string): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }> => {
      const source = parseSource(url);
      if (!source) {
        return {
          ok: false,
          error: "Não reconheci o link — use YouTube (vídeo ou playlist), Spotify ou um link direto de áudio (.mp3, .m4a…).",
        };
      }
      const sameRef = (i: MediaItem) => i.kind === source.kind && i.ref === source.ref;
      if (itemsRef.current.some(sameRef)) return { ok: false, error: "Esse item já está na sua biblioteca." };

      const typed = manualTitle?.trim();
      const meta = await fetchMeta(source);
      const item: MediaItem = {
        id: uid(source.kind),
        ...source,
        url: url.trim(),
        title: typed || meta.title || "Sem título",
        thumb: meta.thumb,
        addedAt: Date.now(),
      };
      setItems((prev) => (prev.some(sameRef) ? prev : [...prev, item]));
      return { ok: true, item };
    },
    []
  );

  /** Arquivo do computador: o id depende do nome e do tamanho, para retomar o ponto se ele voltar. */
  const addFile = useCallback((file: File): MediaItem => {
    const id = `file-${file.name}-${file.size}`;
    const existing = itemsRef.current.find((i) => i.id === id);
    if (existing) return existing;
    const item: MediaItem = {
      id,
      kind: "audio",
      ref: URL.createObjectURL(file),
      url: file.name,
      title: file.name.replace(/\.[a-z0-9]+$/i, ""),
      addedAt: Date.now(),
      local: true,
    };
    setItems((prev) => [...prev, item]);
    return item;
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const gone = prev.find((i) => i.id === id);
      if (gone?.local) URL.revokeObjectURL(gone.ref);
      return prev.filter((i) => i.id !== id);
    });
    setDecks((prev) => prev.map((d) => (d.itemId === id ? { ...d, itemId: null } : d)));
  }, []);

  const renameItem = useCallback(
    (id: string, title: string) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, title: title.trim() || i.title } : i))),
    []
  );

  /** Move o item uma posição para cima (-1) ou para baixo (+1). */
  const moveItem = useCallback((id: string, delta: number) => {
    setItems((prev) => {
      const i = prev.findIndex((t) => t.id === id);
      const j = i + delta;
      if (i === -1 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(i, 1);
      next.splice(j, 0, item);
      return next;
    });
  }, []);

  const addDeck = useCallback(() => {
    setDecks((prev) => (prev.length >= MAX_DECKS ? prev : [...prev, newDeck(`Canal ${prev.length + 1}`)]));
  }, []);

  const removeDeck = useCallback((id: string) => setDecks((prev) => prev.filter((d) => d.id !== id)), []);

  const updateDeck = useCallback(
    (id: string, patch: Partial<Deck>) => setDecks((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d))),
    []
  );

  const getProgress = useCallback((itemId: string): Progress | undefined => progressRef.current[itemId], []);

  const flushProgress = useCallback(() => {
    if (progressTimer.current) window.clearTimeout(progressTimer.current);
    progressTimer.current = null;
    // guarda só os 60 mais recentes
    const entries = Object.entries(progressRef.current).sort((a, b) => b[1].at - a[1].at).slice(0, 60);
    progressRef.current = Object.fromEntries(entries);
    store.set(PROGRESS_KEY, JSON.stringify(progressRef.current));
  }, []);

  /** Grava a posição com atraso, para não escrever no storage a cada segundo. */
  const saveProgress = useCallback(
    (itemId: string, p: Omit<Progress, "at"> | null) => {
      if (p) progressRef.current[itemId] = { ...p, at: Date.now() };
      else delete progressRef.current[itemId];
      if (!progressTimer.current) progressTimer.current = window.setTimeout(flushProgress, 4000);
    },
    [flushProgress]
  );

  // fechar a aba no meio de um audiobook não pode perder o ponto
  useEffect(() => {
    if (!hydrated) return;
    const onHide = () => progressTimer.current && flushProgress();
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [hydrated, flushProgress]);

  return {
    items,
    decks,
    hydrated,
    addLink,
    addFile,
    removeItem,
    renameItem,
    moveItem,
    addDeck,
    removeDeck,
    updateDeck,
    getProgress,
    saveProgress,
  };
}
