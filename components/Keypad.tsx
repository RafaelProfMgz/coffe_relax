"use client";

import { useSound } from "@/hooks/useSound";

export interface KeyDef {
  label: string;
  /** índice na escala pentatônica do motor de áudio */
  index: number;
  hint: string;
  space?: boolean;
}

export const KEYS: KeyDef[] = [
  { label: "H", index: 0, hint: "dó" },
  { label: "J", index: 1, hint: "ré" },
  { label: "K", index: 2, hint: "mi" },
  { label: "L", index: 3, hint: "sol" },
  { label: "W", index: 4, hint: "lá" },
  { label: "B", index: 5, hint: "dó↑" },
  { label: "[ SPACE ]", index: 7, hint: "grave", space: true },
];

export default function Keypad({
  onPlay,
  downKey,
}: {
  onPlay: (key: KeyDef) => void;
  downKey: string | null;
}) {
  const sound = useSound();

  return (
    <>
      <div className="keypad" aria-label="Teclado de notas">
        {KEYS.map((k) => (
          <button
            key={k.label}
            className={`key ${k.space ? "spacebar" : ""} ${downKey === k.label ? "is-down" : ""}`}
            onMouseEnter={sound.hover}
            onClick={() => onPlay(k)}
            aria-label={`Tocar ${k.hint} — tecla ${k.label}`}
            title={k.hint}
          >
            {k.label}
          </button>
        ))}
      </div>
      <p className="keyhint">h j k l w b [espaço] — escala pentatônica: qualquer sequência soa bem</p>
    </>
  );
}
