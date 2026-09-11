"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { getAudioEngine, type LayerId } from "@/lib/audio-engine";
import { useConsent } from "@/hooks/useConsent";
import { store } from "@/lib/storage";

interface SoundApi {
  ready: boolean;
  /** Liga o contexto de áudio — precisa vir de um gesto do usuário. */
  awaken: () => Promise<void>;
  click: () => void;
  hover: () => void;
  toggle: (on: boolean) => void;
  confirm: () => void;
  reject: () => void;
  chime: () => void;
  note: (index: number) => void;
  /** Volume geral 0..100. */
  volume: number;
  setVolume: (v: number) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
  /** Camadas de ambiente ativas → volume 0..1. */
  layers: Record<string, number>;
  toggleLayer: (id: LayerId) => void;
  setLayerVolume: (id: LayerId, v: number) => void;
  stopAllLayers: () => void;
}

const SoundContext = createContext<SoundApi | null>(null);

const VOL_KEY = "coffe_volume";
const MUTE_KEY = "coffe_muted";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const engine = useMemo(() => getAudioEngine(), []);
  const [ready, setReady] = useState(false);
  const [volume, setVolumeState] = useState(65);
  const [muted, setMutedState] = useState(false);
  const [layers, setLayers] = useState<Record<string, number>>({});
  const { ready: consentReady, allowPreferences } = useConsent();

  // Só lemos o volume salvo depois que o usuário liberou as preferências
  useEffect(() => {
    if (!consentReady || !allowPreferences) return;
    const v = store.get(VOL_KEY);
    if (v !== null) setVolumeState(Number(v));
    const m = store.get(MUTE_KEY);
    if (m !== null) setMutedState(m === "1");
  }, [consentReady, allowPreferences]);

  const applyVolume = useCallback(
    (v: number, m: boolean) => {
      engine.setVolume(m ? 0 : (v / 100) * 0.9);
    },
    [engine]
  );

  useEffect(() => {
    if (!ready) return;
    applyVolume(volume, muted);
  }, [ready, volume, muted, applyVolume]);

  const awaken = useCallback(async () => {
    await engine.init();
    applyVolume(volume, muted);
    setReady(true);
  }, [engine, applyVolume, volume, muted]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(v)));
    setVolumeState(clamped);
    store.set(VOL_KEY, String(clamped));
  }, []);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
    store.set(MUTE_KEY, m ? "1" : "0");
  }, []);

  const guard = useCallback(
    (fn: () => void) => () => {
      if (!ready || muted) return;
      fn();
    },
    [ready, muted]
  );

  const click = useMemo(() => guard(() => engine.click()), [guard, engine]);
  const hover = useMemo(() => guard(() => engine.hover()), [guard, engine]);
  const confirm = useMemo(() => guard(() => engine.confirm()), [guard, engine]);
  const reject = useMemo(() => guard(() => engine.reject()), [guard, engine]);
  const chime = useMemo(() => guard(() => engine.chime()), [guard, engine]);

  const toggle = useCallback(
    (on: boolean) => {
      if (!ready || muted) return;
      engine.toggle(on);
    },
    [ready, muted, engine]
  );

  const note = useCallback(
    (index: number) => {
      if (!ready || muted) return;
      engine.note(index);
    },
    [ready, muted, engine]
  );

  const toggleLayer = useCallback(
    (id: LayerId) => {
      if (!ready) return;
      if (engine.isLayerOn(id)) {
        engine.stopLayer(id);
        setLayers((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        engine.startLayer(id, 0.6);
        setLayers((prev) => ({ ...prev, [id]: 0.6 }));
      }
    },
    [ready, engine]
  );

  const setLayerVolume = useCallback(
    (id: LayerId, v: number) => {
      engine.setLayerVolume(id, v);
      setLayers((prev) => (prev[id] === undefined ? prev : { ...prev, [id]: v }));
    },
    [engine]
  );

  const stopAllLayers = useCallback(() => {
    engine.stopAllLayers();
    setLayers({});
  }, [engine]);

  const api: SoundApi = {
    ready,
    awaken,
    click,
    hover,
    toggle,
    confirm,
    reject,
    chime,
    note,
    volume,
    setVolume,
    muted,
    setMuted,
    layers,
    toggleLayer,
    setLayerVolume,
    stopAllLayers,
  };

  return <SoundContext.Provider value={api}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundApi {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound precisa estar dentro de <SoundProvider>");
  return ctx;
}
