let isInitialized = false;
let globalZIndex = 100;
let globalVolume = 50; // Volume Master (0 a 100)
let notesData = [];

const notePalette = [
  "#fef3ba",
  "#a8e6cf",
  "#ffaaa5",
  "#c8d9eb",
  "#e5c1e5",
  "#ffd3b6",
];

const NotesAudio = {
  ctx: null,
  lastPlayTime: 0,
  minInterval: 30,
  init() {
    if (!this.ctx)
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  play(type) {
    if (!this.ctx) return;

    // Respeita o Master Volume mudo no Web Audio API puro
    if (globalVolume === 0) return;

    const now = Date.now();
    if (now - this.lastPlayTime < this.minInterval) return;
    this.lastPlayTime = now;

    const ctx = this.ctx;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    const now_audio = ctx.currentTime;

    // Modulador de volume baseado no Master
    const masterGain = globalVolume / 100;

    switch (type) {
      case "click":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, now_audio);
        oscillator.frequency.exponentialRampToValueAtTime(
          400,
          now_audio + 0.05,
        );
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, now_audio);
        gainNode.gain.setValueAtTime(0.15 * masterGain, now_audio);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now_audio + 0.08);
        oscillator.start(now_audio);
        oscillator.stop(now_audio + 0.08);
        break;
      case "hover":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1200, now_audio);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1500, now_audio);
        gainNode.gain.setValueAtTime(0.03 * masterGain, now_audio);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now_audio + 0.04);
        oscillator.start(now_audio);
        oscillator.stop(now_audio + 0.04);
        break;
      case "success":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523, now_audio);
        oscillator.frequency.setValueAtTime(659, now_audio + 0.1);
        oscillator.frequency.setValueAtTime(784, now_audio + 0.2);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(4000, now_audio);
        gainNode.gain.setValueAtTime(0.1 * masterGain, now_audio);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now_audio + 0.4);
        oscillator.start(now_audio);
        oscillator.stop(now_audio + 0.4);
        break;
      case "pop":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, now_audio);
        oscillator.frequency.exponentialRampToValueAtTime(
          200,
          now_audio + 0.06,
        );
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2500, now_audio);
        gainNode.gain.setValueAtTime(0.15 * masterGain, now_audio);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now_audio + 0.1);
        oscillator.start(now_audio);
        oscillator.stop(now_audio + 0.1);
        break;
      case "drop":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(150, now_audio);
        oscillator.frequency.exponentialRampToValueAtTime(80, now_audio + 0.1);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, now_audio);
        gainNode.gain.setValueAtTime(0.2 * masterGain, now_audio);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now_audio + 0.15);
        oscillator.start(now_audio);
        oscillator.stop(now_audio + 0.15);
        break;
      case "tap":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1000, now_audio);
        oscillator.frequency.exponentialRampToValueAtTime(
          600,
          now_audio + 0.03,
        );
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3000, now_audio);
        gainNode.gain.setValueAtTime(0.08 * masterGain, now_audio);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now_audio + 0.05);
        oscillator.start(now_audio);
        oscillator.stop(now_audio + 0.05);
        break;
      case "swoosh":
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(200, now_audio);
        oscillator.frequency.exponentialRampToValueAtTime(
          800,
          now_audio + 0.15,
        );
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, now_audio);
        filter.frequency.linearRampToValueAtTime(3000, now_audio + 0.1);
        gainNode.gain.setValueAtTime(0.05 * masterGain, now_audio);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now_audio + 0.2);
        oscillator.start(now_audio);
        oscillator.stop(now_audio + 0.2);
        break;
    }
  },
};

const StorageService = {
  load() {
    const data = localStorage.getItem("vim-cafe-notes");
    return data ? JSON.parse(data) : [];
  },
  save() {
    localStorage.setItem("vim-cafe-notes", JSON.stringify(notesData));
  },
};

const masterFilter = new Tone.Filter(20000, "lowpass").toDestination();

const keysSynth = new Tone.PolySynth(Tone.FMSynth, {
  harmonicity: 3,
  modulationIndex: 3.5,
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.01,
    decay: 1.5,
    sustain: 0.2,
    release: 2,
  },
  modulation: { type: "triangle" },
}).connect(masterFilter);
keysSynth.volume.value = -12;

const thockSynth = new Tone.MembraneSynth({
  pitchDecay: 0.008,
  octaves: 2,
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 0.01,
  },
}).connect(masterFilter);
thockSynth.volume.value = -5;

const spacebarSynth = new Tone.MembraneSynth({
  pitchDecay: 0.02,
  octaves: 1.5,
  oscillator: { type: "square" },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0,
    release: 0.05,
  },
}).connect(masterFilter);
spacebarSynth.volume.value = -8;

const switchClick = new Tone.NoiseSynth({
  noise: { type: "pink" },
  envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
}).connect(masterFilter);
switchClick.volume.value = -15;

const rainPlayer = new Tone.Player({
  url: "https://actions.google.com/sounds/v1/weather/forest_wind_summer.ogg",
  loop: true,
}).connect(masterFilter);
rainPlayer.volume.value = -Infinity;

const riverPlayer = new Tone.Player({
  url: "https://actions.google.com/sounds/v1/water/small_stream_flowing.ogg",
  loop: true,
}).connect(masterFilter);
riverPlayer.volume.value = -Infinity;

const tapeNoise = new Tone.Noise("pink").start();
const tapeFilter = new Tone.Filter(3000, "bandpass").connect(masterFilter);
tapeNoise.connect(tapeFilter);
tapeNoise.volume.value = -Infinity;

const vimLogs = [
  ":w cafe.txt",
  ":set relax=true",
  "Compilando grãos...",
  ":PlugInstall paz-interior",
  "GG (indo para o topo)",
  "dd (apagando o estresse)",
  "shift+a (inserindo no final)",
  "Avaliando syntax highlighting...",
  ":q! (ignorando problemas)",
];

// ----- CONTROLE DE VOLUME MASTER -----
function updateVolume() {
  // Atualiza o display visual
  document.getElementById("vol-display").innerText = `VOL ${globalVolume}%`;

  // Aplica volume no Tone.js (Converte porcentagem em Decibéis)
  if (globalVolume === 0) {
    Tone.Destination.volume.rampTo(-Infinity, 0.1);
  } else {
    // Mapeia 0-100 para decibéis. (100 = 0dB, 10 = ~ -20dB)
    const amp = globalVolume / 100;
    const db = 20 * Math.log10(amp);
    Tone.Destination.volume.rampTo(db, 0.1);
  }
}

function changeVolume(delta) {
  globalVolume += delta;
  if (globalVolume > 100) globalVolume = 100;
  if (globalVolume < 0) globalVolume = 0;

  updateVolume();
  document.getElementById("log-text").innerText = `:set volume=${globalVolume}`;

  if (globalVolume > 0 && delta > 0) NotesAudio.play("click");
  else if (globalVolume > 0 && delta < 0) NotesAudio.play("swoosh");
}

document
  .getElementById("btn-vol-up")
  .addEventListener("click", () => changeVolume(10));
document
  .getElementById("btn-vol-down")
  .addEventListener("click", () => changeVolume(-10));
// ------------------------------------

async function initExperience() {
  if (isInitialized) return;

  document.getElementById("overlay-text").innerHTML =
    "$ npm install sons-da-natureza... <span class='cursor-blink'></span>";
  document.getElementById("overlay-subtext").innerText =
    "[Baixando arquivos de áudio reais]";

  await Tone.start();
  await Tone.loaded();

  updateVolume(); // Seta o volume inicial correto

  rainPlayer.start();
  riverPlayer.start();

  NotesAudio.init();
  isInitialized = true;

  const overlay = document.getElementById("start-overlay");
  overlay.style.opacity = "0";
  setTimeout(() => {
    overlay.style.display = "none";
    document.getElementById("main-ui").classList.add("visible");
  }, 500);

  keysSynth.triggerAttackRelease(["C4", "E4", "G4", "C5"], "2n");

  notesData = StorageService.load();
  notesData.forEach(renderNote);
}

function updateTerminal() {
  document.getElementById("log-text").innerText =
    vimLogs[Math.floor(Math.random() * vimLogs.length)];
}

const keys = document.querySelectorAll(".key");
keys.forEach((key) => {
  key.addEventListener("mousedown", () => {
    const note = key.getAttribute("data-note");
    keysSynth.triggerAttackRelease(note, "8n");
    if (key.classList.contains("spacebar"))
      spacebarSynth.triggerAttackRelease("E1", "16n");
    else thockSynth.triggerAttackRelease("C2", "32n");
    updateTerminal();
  });
  key.addEventListener("mouseup", () => {
    if (!key.classList.contains("spacebar"))
      thockSynth.triggerAttackRelease("C3", "64n", Tone.now(), 0.3);
  });
  key.addEventListener("mouseleave", () => {
    if (key.matches(":active") && !key.classList.contains("spacebar"))
      thockSynth.triggerAttackRelease("C3", "64n", Tone.now(), 0.3);
  });
});

document.querySelectorAll(".toggle").forEach((toggle) => {
  toggle.addEventListener("change", (e) => {
    switchClick.triggerAttackRelease("16n");
    thockSynth.triggerAttackRelease(e.target.checked ? "G3" : "E3", "32n");
  });
});

document.getElementById("toggle-rain").addEventListener("change", (e) => {
  if (e.target.checked) {
    rainPlayer.volume.rampTo(-5, 2);
    document.getElementById("log-text").innerText = ":set chuva=on";
  } else {
    rainPlayer.volume.rampTo(-Infinity, 1);
    document.getElementById("log-text").innerText = ":set chuva=off";
  }
});

document.getElementById("toggle-lofi").addEventListener("change", (e) => {
  if (e.target.checked) {
    masterFilter.frequency.rampTo(2000, 0.5);
    tapeNoise.volume.rampTo(-10, 0.5);
    document.getElementById("log-text").innerText = ":set lo_fi_mode=on";
  } else {
    masterFilter.frequency.rampTo(20000, 0.5);
    tapeNoise.volume.rampTo(-Infinity, 0.5);
    document.getElementById("log-text").innerText = ":set lo_fi_mode=off";
  }
});

document.getElementById("toggle-river").addEventListener("change", (e) => {
  if (e.target.checked) {
    riverPlayer.volume.rampTo(-5, 2);
    document.getElementById("log-text").innerText = ":set rio=on";
  } else {
    riverPlayer.volume.rampTo(-Infinity, 1);
    document.getElementById("log-text").innerText = ":set rio=off";
  }
});

document.getElementById("toggle-focus").addEventListener("change", (e) => {
  if (e.target.checked) {
    document.body.style.backgroundColor = "var(--bg0)";
    document.body.classList.add("focus-mode");
    document.getElementById("log-text").innerText = ":Foco total ativado.";
  } else {
    document.body.style.backgroundColor = "var(--bg-hard)";
    document.body.classList.remove("focus-mode");
  }
});

const keyMap = { h: 0, j: 1, k: 2, l: 3, w: 4, b: 5, " ": 6 };

document.addEventListener("keydown", (e) => {
  if (["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)) return;

  // Atalhos de Volume
  if (e.key === "-" || e.key === "_") {
    changeVolume(-10);
    return;
  }
  if (e.key === "=" || e.key === "+") {
    changeVolume(10);
    return;
  }

  const keyChar = e.key.toLowerCase();
  const keyIndex = keyMap[keyChar];

  if (
    keyIndex !== undefined &&
    !keys[keyIndex].classList.contains("active-fake")
  ) {
    if (keyChar === " ") e.preventDefault();
    keys[keyIndex].classList.add("active-fake");
    keysSynth.triggerAttackRelease(
      keys[keyIndex].getAttribute("data-note"),
      "8n",
    );

    if (keyChar === " ") spacebarSynth.triggerAttackRelease("E1", "16n");
    else thockSynth.triggerAttackRelease("C2", "32n");
    updateTerminal();
  }
});

document.addEventListener("keyup", (e) => {
  if (["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)) return;

  const keyIndex = keyMap[e.key.toLowerCase()];
  if (keyIndex !== undefined) {
    keys[keyIndex].classList.remove("active-fake");
    if (e.key !== " ")
      thockSynth.triggerAttackRelease("C3", "64n", Tone.now(), 0.3);
  }
});

function getNextColor() {
  const usedColors = notesData.map((n) => n.color.toLowerCase());
  const availableColors = notePalette.filter(
    (color) => !usedColors.includes(color.toLowerCase()),
  );
  if (availableColors.length > 0)
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  else return notePalette[Math.floor(Math.random() * notePalette.length)];
}

function createNote() {
  NotesAudio.play("success");
  const newNote = {
    id: Date.now().toString(),
    text: "",
    x: window.innerWidth / 2 - 120 + (Math.random() * 40 - 20),
    y: window.innerHeight / 2 - 100 + (Math.random() * 40 - 20),
    color: getNextColor(),
  };
  notesData.push(newNote);
  StorageService.save();
  renderNote(newNote);
}

function renderNote(noteData) {
  noteData.color = noteData.color || notePalette[0];

  const noteEl = document.createElement("div");
  noteEl.className = "note";
  noteEl.style.left = `${noteData.x}px`;
  noteEl.style.top = `${noteData.y}px`;
  noteEl.style.backgroundColor = noteData.color;

  globalZIndex++;
  noteEl.style.zIndex = globalZIndex;

  noteEl.innerHTML = `
        <div class="note-header">
            <span style="font-size: 10px; color: var(--fg); font-weight: bold;">-- INSERT --</span>
            <button class="btn-close">✖</button>
        </div>
        <textarea class="note-body" spellcheck="false" placeholder="Digite algo relaxante...">${noteData.text}</textarea>
        <div class="note-footer">
            <span style="font-size: 10px; font-weight: bold;">Cor:</span>
            <input type="color" class="cor-nota" value="${noteData.color}" />
        </div>
    `;

  noteEl.addEventListener("mousedown", () => {
    globalZIndex++;
    noteEl.style.zIndex = globalZIndex;
  });

  noteEl.querySelector(".btn-close").addEventListener("mousedown", (e) => {
    e.stopPropagation();
    NotesAudio.play("swoosh");
    noteEl.remove();
    notesData = notesData.filter((n) => n.id !== noteData.id);
    StorageService.save();
  });

  const seletorDeCor = noteEl.querySelector(".cor-nota");
  seletorDeCor.addEventListener("input", function (e) {
    noteEl.style.backgroundColor = e.target.value;
    const notaParaSalvar = notesData.find((n) => n.id === noteData.id);
    if (notaParaSalvar) {
      notaParaSalvar.color = e.target.value;
      StorageService.save();
    }
  });

  const textarea = noteEl.querySelector(".note-body");
  textarea.addEventListener("input", (e) => {
    const notaParaSalvar = notesData.find((n) => n.id === noteData.id);
    if (notaParaSalvar) {
      notaParaSalvar.text = e.target.value;
      StorageService.save();
    }
  });
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") NotesAudio.play("tap");
    else if (e.key === "Backspace") NotesAudio.play("swoosh");
    else NotesAudio.play("click");
  });

  const header = noteEl.querySelector(".note-header");
  header.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return;
    NotesAudio.play("pop");

    let startX = e.clientX;
    let startY = e.clientY;
    let initialLeft = noteEl.offsetLeft;
    let initialTop = noteEl.offsetTop;

    noteEl.style.transform = "scale(1.02)";

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      noteEl.style.left = `${initialLeft + dx}px`;
      noteEl.style.top = `${initialTop + dy}px`;
    };

    const onMouseUp = () => {
      NotesAudio.play("drop");
      noteEl.style.transform = "scale(1)";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      const noteRef = notesData.find((n) => n.id === noteData.id);
      if (noteRef) {
        noteRef.x = noteEl.offsetLeft;
        noteRef.y = noteEl.offsetTop;
        StorageService.save();
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  document.body.appendChild(noteEl);
}
