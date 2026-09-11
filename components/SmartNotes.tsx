"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSound } from "@/hooks/useSound";
import { useConsent } from "@/hooks/useConsent";
import { store } from "@/lib/storage";

interface NoteData {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

const COLORS = ["#fff3d6", "#e6f0e2", "#ffe6d9", "#e2edf2", "#f4e3f0", "#f0ecd8"];

export default function SmartNotes() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement | null>(null);
  const sound = useSound();
  const { ready: consentReady, allowPreferences } = useConsent();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!consentReady) return;
    if (allowPreferences) {
      try {
        const raw = store.get("coffe_notes");
        if (raw) setNotes(JSON.parse(raw) as NoteData[]);
      } catch {
        /* json inválido */
      }
    } else {
      setNotes([]);
    }
    setLoaded(true);
  }, [consentReady, allowPreferences]);

  useEffect(() => {
    if (!loaded) return;
    store.set("coffe_notes", JSON.stringify(notes));
  }, [notes, loaded]);

  const update = useCallback(
    (id: string, partial: Partial<NoteData>) =>
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...partial } : n))),
    []
  );

  const addNote = useCallback(() => {
    sound.confirm();
    setNotes((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        x: 24 + Math.random() * 220,
        y: 24 + Math.random() * 160,
        text: "",
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      },
    ]);
  }, [sound]);

  // Arraste: as coordenadas são relativas ao quadro, não à janela
  const onPointerDown = (id: string, e: React.PointerEvent) => {
    const note = notes.find((n) => n.id === id);
    const board = boardRef.current?.getBoundingClientRect();
    if (!note || !board) return;
    offset.current = { x: e.clientX - board.left - note.x, y: e.clientY - board.top - note.y };
    setDragging(id);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const board = boardRef.current?.getBoundingClientRect();
      if (!board) return;
      update(dragging, {
        x: Math.max(0, Math.min(board.width - 212, e.clientX - board.left - offset.current.x)),
        y: Math.max(0, Math.min(board.height - 60, e.clientY - board.top - offset.current.y)),
      });
    };
    const onUp = () => setDragging(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, update]);

  return (
    <div className="notes-board" ref={boardRef}>
      {notes.length === 0 && (
        <p
          className="empty-note"
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", maxWidth: 340, textAlign: "center" }}
        >
          O mural está limpo. Solte aqui uma ideia, uma lista ou só um lembrete de respirar.
        </p>
      )}

      {notes.map((n) => (
        <div
          key={n.id}
          className={`note-sticky ${dragging === n.id ? "is-dragging" : ""}`}
          style={{ left: n.x, top: n.y, background: n.color }}
        >
          <div className="note-header" onPointerDown={(e) => onPointerDown(n.id, e)}>
            <span>coffe • nota</span>
            <button
              className="note-del"
              onClick={() => {
                sound.reject();
                setNotes((prev) => prev.filter((x) => x.id !== n.id));
              }}
              aria-label="Remover nota"
            >
              ✕
            </button>
          </div>
          <textarea
            value={n.text}
            placeholder="escreva devagar..."
            aria-label="Conteúdo da nota"
            onChange={(e) => update(n.id, { text: e.target.value })}
          />
          <div className="note-colors">
            {COLORS.map((c) => (
              <button
                key={c}
                className="note-color"
                style={{ background: c }}
                aria-label={`Pintar a nota de ${c}`}
                onClick={() => {
                  sound.click();
                  update(n.id, { color: c });
                }}
              />
            ))}
          </div>
        </div>
      ))}

      <button className="fab" onClick={addNote} onMouseEnter={sound.hover} aria-label="Criar nova nota">
        + nova nota
      </button>
    </div>
  );
}
