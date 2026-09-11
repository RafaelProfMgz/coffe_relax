"use client";

import { useSound } from "@/hooks/useSound";
import SoundButton from "@/components/ui/SoundButton";
import type { LayerId } from "@/lib/audio-engine";

interface LayerInfo {
  id: LayerId;
  icon: string;
  label: string;
  desc: string;
}

/**
 * Todas as camadas são sintetizadas ao vivo no navegador — sem download,
 * sem streaming, sem licença a respeitar. Podem tocar todas juntas.
 */
const LAYERS: LayerInfo[] = [
  { id: "rain", icon: "🌧", label: "Chuva", desc: "Chuva média na janela, com pingos soltos." },
  { id: "storm", icon: "⛈", label: "Trovão", desc: "Trovões graves e distantes, de vez em quando." },
  { id: "ocean", icon: "🌊", label: "Mar", desc: "Ondas longas quebrando devagar." },
  { id: "forest", icon: "🌲", label: "Floresta", desc: "Folhagem ao vento e pássaros dispersos." },
  { id: "fire", icon: "🔥", label: "Lareira", desc: "Brasa estalando, calor grave e constante." },
  { id: "cafe", icon: "☕", label: "Cafeteria", desc: "Murmúrio de conversa e louça ao fundo." },
  { id: "wind", icon: "🍂", label: "Vento", desc: "Rajadas de outono que vão e voltam." },
  { id: "crickets", icon: "🌙", label: "Noite", desc: "Grilos e um colchão grave de madrugada." },
  { id: "bowl", icon: "🎐", label: "Tigela", desc: "Tigela tibetana soando a cada tantos minutos." },
  { id: "vinyl", icon: "📻", label: "Vinil lo-fi", desc: "Chiado de fita e acordes lentos." },
];

/** Combinações prontas para quem não quer mexer em nada. */
const PRESETS: Array<{ name: string; icon: string; mix: Partial<Record<LayerId, number>> }> = [
  { name: "Tempestade lá fora", icon: "⛈", mix: { rain: 0.7, storm: 0.6, wind: 0.35 } },
  { name: "Café da tarde", icon: "☕", mix: { cafe: 0.6, vinyl: 0.45, rain: 0.25 } },
  { name: "Cabana de inverno", icon: "🔥", mix: { fire: 0.6, wind: 0.4, bowl: 0.3 } },
  { name: "Noite no campo", icon: "🌙", mix: { crickets: 0.5, wind: 0.25, ocean: 0.2 } },
  { name: "Deep focus", icon: "🧠", mix: { rain: 0.45, ocean: 0.3 } },
];

export default function AmbienceMixer() {
  const sound = useSound();
  const active = Object.keys(sound.layers).length;

  const applyPreset = (mix: Partial<Record<LayerId, number>>) => {
    sound.stopAllLayers();
    // pequeno atraso para o fade-out da mistura anterior não estalar
    window.setTimeout(() => {
      (Object.entries(mix) as Array<[LayerId, number]>).forEach(([id, vol]) => {
        sound.toggleLayer(id);
        sound.setLayerVolume(id, vol);
      });
    }, 120);
  };

  return (
    <section className="panel" aria-label="Mesa de sons ambientes">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Mesa de Ambiente</h2>
          <p className="panel-sub">
            Sons gerados ao vivo no seu navegador. Ligue quantos quiser e misture com a playlist.
          </p>
        </div>
        {active > 0 && (
          <SoundButton variant="pill" sfx="reject" onClick={sound.stopAllLayers} title="Silenciar tudo">
            silenciar ({active})
          </SoundButton>
        )}
      </header>

      <div className="preset-row">
        {PRESETS.map((p) => (
          <SoundButton key={p.name} variant="pill" sfx="confirm" onClick={() => applyPreset(p.mix)} title={p.name}>
            <span aria-hidden>{p.icon}</span> {p.name}
          </SoundButton>
        ))}
      </div>

      <div className="mixer">
        {LAYERS.map((layer) => {
          const on = sound.layers[layer.id] !== undefined;
          const vol = sound.layers[layer.id] ?? 0.6;
          return (
            <div key={layer.id} className={`mix-cell ${on ? "is-on" : ""}`}>
              <button
                className="mix-toggle"
                onMouseEnter={sound.hover}
                onClick={() => {
                  sound.toggle(!on);
                  sound.toggleLayer(layer.id);
                }}
                aria-pressed={on}
                aria-label={`${layer.label} — ${layer.desc}`}
                title={layer.desc}
              >
                <span className="mix-icon" aria-hidden>
                  {layer.icon}
                </span>
                <span className="mix-label">{layer.label}</span>
              </button>
              <input
                className="mix-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(vol * 100)}
                disabled={!on}
                aria-label={`Volume de ${layer.label}`}
                onChange={(e) => sound.setLayerVolume(layer.id, Number(e.target.value) / 100)}
              />
            </div>
          );
        })}
      </div>

      {!sound.ready && <p className="empty-note">Clique em qualquer lugar para acordar o áudio.</p>}
    </section>
  );
}
