"use client";

/**
 * Motor de áudio do coffe to relax.
 *
 * Tudo é sintetizado ao vivo com a Web Audio API — nenhum arquivo externo,
 * nenhuma requisição de rede, nenhum problema de CORS ou licença.
 *
 * Dois barramentos:
 *   uiBus  → cliques, hovers, teclas (curtos, quentes, "gostosinhos")
 *   ambBus → camadas de ambiente contínuas, mixáveis entre si
 * Ambos passam por um envio de reverb (sala pequena, cauda macia) e por um
 * compressor suave antes da saída, o que tira qualquer aspereza digital.
 */

export type LayerId =
  | "rain"
  | "storm"
  | "ocean"
  | "forest"
  | "fire"
  | "cafe"
  | "wind"
  | "crickets"
  | "bowl"
  | "vinyl";

interface Layer {
  gain: GainNode;
  volume: number;
  stop: () => void;
}

/** Escala pentatônica maior — qualquer combinação de notas soa consonante. */
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private uiBus: GainNode | null = null;
  private ambBus: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private white: AudioBuffer | null = null;
  private brown: AudioBuffer | null = null;
  private layers = new Map<LayerId, Layer>();
  private noteCursor = 0;
  private lastClickAt = 0;

  get started() {
    return this.ctx !== null;
  }

  /** Precisa ser chamado a partir de um gesto do usuário (clique/tecla). */
  async init(): Promise<void> {
    if (this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return;
    }
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;

    const ctx = new AC();
    await ctx.resume();
    this.ctx = ctx;

    // Cadeia mestre: buses → compressor gentil → saída
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 26;
    comp.ratio.value = 3;
    comp.attack.value = 0.006;
    comp.release.value = 0.28;
    comp.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(comp);
    this.master = master;

    const uiBus = ctx.createGain();
    uiBus.gain.value = 0.9;
    uiBus.connect(master);
    this.uiBus = uiBus;

    const ambBus = ctx.createGain();
    ambBus.gain.value = 0.0001;
    ambBus.connect(master);
    this.ambBus = ambBus;
    ambBus.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + 1.5);

    // Reverb de sala pequena, feito com ruído decaindo
    const reverb = ctx.createConvolver();
    reverb.buffer = this.makeImpulse(2.6, 2.8);
    const revOut = ctx.createGain();
    revOut.gain.value = 0.55;
    reverb.connect(revOut);
    revOut.connect(master);
    this.reverb = reverb;

    this.white = this.makeNoise("white", 4);
    this.brown = this.makeNoise("brown", 5);
  }

  /** Volume geral, 0..1. */
  setVolume(v: number) {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(Math.max(0.0001, v), this.ctx.currentTime, 0.08);
  }

  /** Volume só do ambiente, 0..1. */
  setAmbienceVolume(v: number) {
    if (!this.ctx || !this.ambBus) return;
    this.ambBus.gain.setTargetAtTime(Math.max(0.0001, v), this.ctx.currentTime, 0.12);
  }

  // ────────────────────────────────────────────── impulsos e buffers

  private makeImpulse(seconds: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  private makeNoise(kind: "white" | "brown", seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    if (kind === "white") {
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } else {
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.2;
      }
    }
    return buf;
  }

  private noiseSource(kind: "white" | "brown", loop = true): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = kind === "white" ? this.white : this.brown;
    src.loop = loop;
    return src;
  }

  private send(node: AudioNode, amount: number) {
    if (!this.ctx || !this.reverb) return;
    const g = this.ctx.createGain();
    g.gain.value = amount;
    node.connect(g);
    g.connect(this.reverb);
  }

  // ────────────────────────────────────────────── sons de interface

  /**
   * A "tecla gostosinha": um híbrido de kalimba com tecla de máquina de
   * escrever. Um transiente curtinho de ruído dá o toque físico; duas senoides
   * afinadas dão o corpo doce; o reverb cola tudo no ambiente.
   */
  private pluck(freq: number, opts: { gain?: number; decay?: number; body?: number; verb?: number } = {}) {
    const ctx = this.ctx;
    const bus = this.uiBus;
    if (!ctx || !bus) return;

    const gain = opts.gain ?? 0.34;
    const decay = opts.decay ?? 0.55;
    const now = ctx.currentTime;

    // Filtro macio na saída — nada de agudo cortante
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 5200;
    tone.Q.value = 0.6;
    tone.connect(bus);
    this.send(tone, opts.verb ?? 0.3);

    const voice = (f: number, level: number, dur: number, type: OscillatorType) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      // leve queda de afinação no ataque: dá a sensação de "madeira batida"
      osc.frequency.setValueAtTime(f * 1.012, now);
      osc.frequency.exponentialRampToValueAtTime(f, now + 0.035);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(level, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g);
      g.connect(tone);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    };

    voice(freq, gain, decay, "sine");
    voice(freq * 2.006, gain * (opts.body ?? 0.3), decay * 0.45, "sine");
    voice(freq * 3.01, gain * 0.07, decay * 0.2, "triangle");

    // transiente percussivo
    const noise = this.noiseSource("white", false);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = rand(1500, 2400);
    bp.Q.value = 1.1;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(gain * 0.28, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(tone);
    noise.start(now);
    noise.stop(now + 0.08);
  }

  /** Clique padrão: caminha pela pentatônica, então cliques seguidos viram melodia. */
  click() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // cliques muito rápidos sobem de nota em vez de empilhar no mesmo tom
    if (now - this.lastClickAt > 1.2) this.noteCursor = 0;
    this.lastClickAt = now;
    const freq = PENTATONIC[this.noteCursor % 6] * (this.noteCursor >= 6 ? 2 : 1);
    this.noteCursor = (this.noteCursor + 1) % 8;
    this.pluck(freq * 1.5, { gain: 0.3, decay: 0.6 });
  }

  /** Hover: quase um sussurro, só para o cursor ter textura. */
  hover() {
    const ctx = this.ctx;
    const bus = this.uiBus;
    if (!ctx || !bus) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = pick([1318.5, 1567.98, 1760.0]);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.022, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.connect(g);
    g.connect(bus);
    this.send(g, 0.25);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  /** Ligar/desligar: dois toques, subindo ou descendo. */
  toggle(on: boolean) {
    if (!this.ctx) return;
    const a = on ? 523.25 : 659.25;
    const b = on ? 783.99 : 392.0;
    this.pluck(a, { gain: 0.26, decay: 0.5 });
    window.setTimeout(() => this.pluck(b, { gain: 0.24, decay: 0.7 }), 85);
  }

  /** Confirmação: acorde curto e satisfeito. */
  confirm() {
    if (!this.ctx) return;
    [523.25, 659.25, 783.99].forEach((f, i) =>
      window.setTimeout(() => this.pluck(f, { gain: 0.24, decay: 0.9, verb: 0.4 }), i * 70)
    );
  }

  /** Erro/remoção: nada de bipe agressivo, só um tom grave curto. */
  reject() {
    this.pluck(196.0, { gain: 0.22, decay: 0.35, body: 0.12 });
  }

  /** Nota tocada pelo teclado vim. */
  note(index: number) {
    const f = PENTATONIC[index % PENTATONIC.length];
    this.pluck(f * 2, { gain: 0.36, decay: 1.1, verb: 0.42 });
  }

  /** Sino do pomodoro — tigela tibetana curta. */
  chime() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.bowlStrike(this.uiBus!, 0.3, 440);
  }

  // ────────────────────────────────────────────── camadas de ambiente

  isLayerOn(id: LayerId) {
    return this.layers.has(id);
  }

  layerVolume(id: LayerId) {
    return this.layers.get(id)?.volume ?? 0;
  }

  setLayerVolume(id: LayerId, v: number) {
    const layer = this.layers.get(id);
    if (!layer || !this.ctx) return;
    layer.volume = v;
    layer.gain.gain.setTargetAtTime(Math.max(0.0001, v), this.ctx.currentTime, 0.15);
  }

  stopLayer(id: LayerId) {
    const layer = this.layers.get(id);
    if (!layer || !this.ctx) return;
    // fade out antes de derrubar os nós — evita estalo
    layer.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.25);
    this.layers.delete(id);
    window.setTimeout(() => layer.stop(), 1200);
  }

  stopAllLayers() {
    Array.from(this.layers.keys()).forEach((id) => this.stopLayer(id));
  }

  startLayer(id: LayerId, volume = 0.6) {
    if (!this.ctx || !this.ambBus || this.layers.has(id)) return;
    const ctx = this.ctx;

    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.connect(this.ambBus);

    const disposers: Array<() => void> = [];
    const timers: number[] = [];

    /** Agenda um evento aleatório recorrente enquanto a camada estiver viva. */
    const every = (minMs: number, maxMs: number, fn: () => void) => {
      let alive = true;
      const loop = () => {
        if (!alive) return;
        const t = window.setTimeout(() => {
          if (!alive) return;
          fn();
          loop();
        }, rand(minMs, maxMs));
        timers.push(t);
      };
      loop();
      disposers.push(() => {
        alive = false;
      });
    };

    const startNode = (node: AudioScheduledSourceNode) => {
      node.start();
      disposers.push(() => {
        try {
          node.stop();
        } catch {
          /* já parado */
        }
      });
    };

    switch (id) {
      case "rain": {
        const src = this.noiseSource("white");
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 420;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 6200;
        const body = ctx.createGain();
        body.gain.value = 0.3;
        src.connect(hp);
        hp.connect(lp);
        lp.connect(body);
        body.connect(gain);
        // respiração lenta da chuva
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.07;
        const lfoG = ctx.createGain();
        lfoG.gain.value = 1100;
        lfo.connect(lfoG);
        lfoG.connect(lp.frequency);
        startNode(src);
        startNode(lfo);
        this.send(body, 0.18);
        // pingos avulsos
        every(140, 900, () => this.drop(gain));
        break;
      }

      case "storm": {
        every(14000, 46000, () => this.thunder(gain));
        break;
      }

      case "ocean": {
        const src = this.noiseSource("brown");
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 900;
        const swell = ctx.createGain();
        swell.gain.value = 0.25;
        src.connect(lp);
        lp.connect(swell);
        swell.connect(gain);
        // maré: uma LFO muito lenta abre o filtro e o volume ao mesmo tempo
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.09;
        const toGain = ctx.createGain();
        toGain.gain.value = 0.18;
        const toFilter = ctx.createGain();
        toFilter.gain.value = 620;
        lfo.connect(toGain);
        toGain.connect(swell.gain);
        lfo.connect(toFilter);
        toFilter.connect(lp.frequency);
        startNode(src);
        startNode(lfo);
        this.send(swell, 0.22);
        break;
      }

      case "forest": {
        const src = this.noiseSource("white");
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 700;
        bp.Q.value = 0.8;
        const g = ctx.createGain();
        g.gain.value = 0.1;
        src.connect(bp);
        bp.connect(g);
        g.connect(gain);
        startNode(src);
        every(2200, 9000, () => {
          const n = Math.floor(rand(2, 6));
          for (let i = 0; i < n; i++) {
            window.setTimeout(() => this.chirp(gain), i * rand(70, 150));
          }
        });
        break;
      }

      case "fire": {
        const src = this.noiseSource("brown");
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 620;
        const g = ctx.createGain();
        g.gain.value = 0.45;
        src.connect(lp);
        lp.connect(g);
        g.connect(gain);
        startNode(src);
        every(45, 420, () => this.crackle(gain, rand(900, 3600), 0.1));
        break;
      }

      case "cafe": {
        // murmúrio: ruído grave com ondulação lenta = conversa distante
        const src = this.noiseSource("brown");
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 480;
        bp.Q.value = 0.7;
        const g = ctx.createGain();
        g.gain.value = 0.34;
        src.connect(bp);
        bp.connect(g);
        g.connect(gain);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.23;
        const lfoG = ctx.createGain();
        lfoG.gain.value = 0.14;
        lfo.connect(lfoG);
        lfoG.connect(g.gain);
        startNode(src);
        startNode(lfo);
        this.send(g, 0.3);
        // louça e colherinhas
        every(5000, 17000, () => this.clink(gain));
        break;
      }

      case "wind": {
        const src = this.noiseSource("white");
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 520;
        bp.Q.value = 2.2;
        const g = ctx.createGain();
        g.gain.value = 0.0001;
        src.connect(bp);
        bp.connect(g);
        g.connect(gain);
        startNode(src);
        this.send(g, 0.25);
        // rajadas: cada uma varre a frequência e o volume
        every(2500, 7500, () => {
          const now = ctx.currentTime;
          const dur = rand(3.5, 8);
          bp.frequency.cancelScheduledValues(now);
          bp.frequency.setValueAtTime(bp.frequency.value, now);
          bp.frequency.linearRampToValueAtTime(rand(280, 1150), now + dur * 0.6);
          g.gain.cancelScheduledValues(now);
          g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), now);
          g.gain.linearRampToValueAtTime(rand(0.1, 0.34), now + dur * 0.45);
          g.gain.linearRampToValueAtTime(0.02, now + dur);
        });
        break;
      }

      case "crickets": {
        // colchão grave da noite
        const pad = ctx.createOscillator();
        pad.type = "triangle";
        pad.frequency.value = 55;
        const padG = ctx.createGain();
        padG.gain.value = 0.14;
        pad.connect(padG);
        padG.connect(gain);
        startNode(pad);
        every(380, 900, () => {
          const n = Math.floor(rand(2, 5));
          for (let i = 0; i < n; i++) window.setTimeout(() => this.cricket(gain), i * 95);
        });
        break;
      }

      case "bowl": {
        this.bowlStrike(gain, 0.5, pick([196.0, 220.0, 261.63]));
        every(22000, 48000, () => this.bowlStrike(gain, 0.5, pick([196.0, 220.0, 261.63, 293.66])));
        break;
      }

      case "vinyl": {
        // chiado de fita
        const src = this.noiseSource("white");
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 2400;
        const g = ctx.createGain();
        g.gain.value = 0.035;
        src.connect(hp);
        hp.connect(g);
        g.connect(gain);
        startNode(src);
        // estalos do disco
        every(120, 1400, () => this.crackle(gain, rand(2200, 5200), 0.06));
        // acordes lentos de fundo
        every(7000, 11000, () => {
          const root = pick([130.81, 146.83, 164.81, 196.0]);
          [1, 1.5, 2.02, 2.51].forEach((mult, i) =>
            window.setTimeout(() => this.padTone(gain, root * mult), i * 220)
          );
        });
        break;
      }
    }

    const layer: Layer = {
      gain,
      volume,
      stop: () => {
        disposers.forEach((d) => d());
        timers.forEach((t) => window.clearTimeout(t));
        try {
          gain.disconnect();
        } catch {
          /* já desconectado */
        }
      },
    };
    this.layers.set(id, layer);
    gain.gain.setTargetAtTime(Math.max(0.0001, volume), ctx.currentTime, 0.6);
  }

  // ────────────────────────────────────────────── eventos pontuais

  private drop(dest: AudioNode) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const f = rand(800, 2600);
    osc.type = "sine";
    osc.frequency.setValueAtTime(f * 1.6, now);
    osc.frequency.exponentialRampToValueAtTime(f, now + 0.03);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(rand(0.01, 0.05), now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(g);
    g.connect(dest);
    this.send(g, 0.4);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  private thunder(dest: AudioNode) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = rand(3.2, 6.5);
    const src = this.noiseSource("brown", false);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(320, now);
    lp.frequency.exponentialRampToValueAtTime(70, now + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(rand(0.25, 0.6), now + rand(0.1, 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(lp);
    lp.connect(g);
    g.connect(dest);
    this.send(g, 0.5);
    src.start(now);
    src.stop(now + dur + 0.2);
  }

  private chirp(dest: AudioNode) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const base = rand(2100, 3600);
    osc.type = "sine";
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.linearRampToValueAtTime(base * rand(1.15, 1.5), now + 0.05);
    osc.frequency.linearRampToValueAtTime(base * 0.95, now + 0.11);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(rand(0.03, 0.08), now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.connect(g);
    g.connect(dest);
    this.send(g, 0.45);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  private cricket(dest: AudioNode) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = rand(3900, 4700);
    const am = ctx.createOscillator();
    am.type = "square";
    am.frequency.value = 52;
    const amG = ctx.createGain();
    amG.gain.value = 0.5;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    am.connect(amG);
    amG.connect(g.gain);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 4300;
    bp.Q.value = 6;
    osc.connect(bp);
    bp.connect(g);
    g.connect(dest);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.02, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    this.send(g, 0.35);
    osc.start(now);
    am.start(now);
    osc.stop(now + 0.17);
    am.stop(now + 0.17);
  }

  private crackle(dest: AudioNode, freq: number, level: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const src = this.noiseSource("white", false);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 2.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(level * rand(0.3, 1), now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + rand(0.015, 0.05));
    src.connect(bp);
    bp.connect(g);
    g.connect(dest);
    src.start(now);
    src.stop(now + 0.08);
  }

  private clink(dest: AudioNode) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const base = rand(1800, 3200);
    [1, 2.76, 5.4].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = base * mult;
      const level = 0.045 / (i + 1);
      g.gain.setValueAtTime(level, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + rand(0.25, 0.6));
      osc.connect(g);
      g.connect(dest);
      this.send(g, 0.5);
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  private padTone(dest: AudioNode, freq: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.detune.value = rand(-8, 8);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.05, now + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
    osc.connect(lp);
    lp.connect(g);
    g.connect(dest);
    this.send(g, 0.45);
    osc.start(now);
    osc.stop(now + 6);
  }

  private bowlStrike(dest: AudioNode, level: number, base: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    // parciais inarmônicas com batimento lento = tigela tibetana
    [
      [1, 1, 9],
      [2.74, 0.4, 6.5],
      [5.42, 0.18, 4.2],
      [8.9, 0.07, 2.6],
    ].forEach(([mult, amp, dur]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = base * mult;
      osc.detune.value = rand(-4, 4);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(level * amp * 0.28, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g);
      g.connect(dest);
      this.send(g, 0.5);
      osc.start(now);
      osc.stop(now + dur + 0.2);
    });
  }
}

let instance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!instance) instance = new AudioEngine();
  return instance;
}

export type { AudioEngine };
