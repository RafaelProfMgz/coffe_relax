"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SoundButton from "@/components/ui/SoundButton";
import { useSound } from "@/hooks/useSound";
import type { Deck, MediaItem, Progress } from "@/hooks/useMediaLibrary";
import { KIND_ICON, KIND_LABEL, fmtTime, parseSource, spotifyTypeLabel } from "@/lib/media-sources";

interface Props {
  items: MediaItem[];
  decks: Deck[];
  hydrated: boolean;
  addLink: (url: string, title?: string) => Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }>;
  addFile: (file: File) => MediaItem;
  removeItem: (id: string) => void;
  renameItem: (id: string, title: string) => void;
  moveItem: (id: string, delta: number) => void;
  getProgress: (itemId: string) => Progress | undefined;
  onPlay: (deckId: string, itemId: string) => void;
}

export default function MediaLibrary({
  items,
  decks,
  hydrated,
  addLink,
  addFile,
  removeItem,
  renameItem,
  moveItem,
  getProgress,
  onPlay,
}: Props) {
  const sound = useSound();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  // mensagens somem sozinhas
  useEffect(() => {
    if (!status) return;
    const id = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(id);
  }, [status]);

  const detected = parseSource(url);

  /** Canal livre primeiro; se todos estiverem ocupados, o primeiro. */
  const freeDeck = useCallback(() => decks.find((d) => !d.itemId) ?? decks[0], [decks]);

  const handleAdd = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const result = await addLink(url, title);
    setSaving(false);
    if (result.ok) {
      sound.confirm();
      setStatus({ kind: "ok", text: `“${result.item.title}” salvo na biblioteca.` });
      setUrl("");
      setTitle("");
    } else {
      sound.reject();
      setStatus({ kind: "err", text: result.error });
    }
  }, [addLink, url, title, saving, sound]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) => t.title.toLowerCase().includes(q));
  }, [items, filter]);

  return (
    <section className="panel" aria-label="Biblioteca de links">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Biblioteca</h2>
          <p className="panel-sub">YouTube (vídeo ou playlist), Spotify ou link de áudio — fica salvo no seu navegador.</p>
        </div>
        <span className="badge">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </header>

      {/* ── Adicionar ──────────────────────────────────────────── */}
      <div className="add-row add-row-top">
        <div className="add-fields">
          <input
            className="field"
            placeholder="youtube.com/…, open.spotify.com/… ou …/livro.mp3"
            value={url}
            aria-label="Link para salvar"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            className="field"
            placeholder="Título (opcional)"
            value={title}
            aria-label="Título do item"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <SoundButton variant="solid" sfx="none" onClick={handleAdd} disabled={saving || !url.trim()}>
          {saving ? "salvando..." : "+ salvar"}
        </SoundButton>
      </div>

      <div className="add-extra">
        {url.trim() && (
          <span className={`detect ${detected ? "is-ok" : "is-bad"}`}>
            {detected
              ? `${KIND_ICON[detected.kind]} ${KIND_LABEL[detected.kind]}${detected.kind === "spotify" ? ` · ${spotifyTypeLabel(detected.spotifyType)}` : ""}${detected.kind === "youtube-playlist" && detected.startVideoId ? " · começa no vídeo do link" : ""}`
              : "link não reconhecido"}
          </span>
        )}
        <button className="link-btn" onClick={() => fileRef.current?.click()}>
          🎧 abrir arquivo do computador
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*,.m4b"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            files.forEach((f) => addFile(f));
            if (files.length) {
              sound.confirm();
              setStatus({ kind: "ok", text: `${files.length === 1 ? "Arquivo aberto" : `${files.length} arquivos abertos`} — fica só nesta sessão, nada é enviado.` });
            }
            e.target.value = "";
          }}
        />
      </div>

      {status && <p className={`status status-${status.kind}`}>{status.text}</p>}

      {/* ── Lista ──────────────────────────────────────────────── */}
      <div className="playlist-head">
        <h3>Salvos</h3>
        {items.length > 3 && (
          <input
            className="field field-sm"
            placeholder="filtrar..."
            value={filter}
            aria-label="Filtrar biblioteca"
            onChange={(e) => setFilter(e.target.value)}
          />
        )}
      </div>

      {hydrated && items.length === 0 && (
        <p className="empty-note">
          Nada por aqui ainda. Cole uma playlist lo-fi do YouTube, um álbum do Spotify ou o link de um audiobook — e toque
          cada um no seu canal, com volume próprio.
        </p>
      )}

      <ul className="playlist">
        {visible.map((t, i) => {
          const inDecks = decks.filter((d) => d.itemId === t.id);
          const saved = getProgress(t.id);
          return (
            <li key={t.id} className={`track ${inDecks.length ? "is-current" : ""}`}>
              <button
                className="track-main"
                onClick={() => {
                  sound.click();
                  const target = inDecks[0] ?? freeDeck();
                  if (target) onPlay(target.id, t.id);
                }}
                onMouseEnter={sound.hover}
                aria-label={`Tocar ${t.title}`}
              >
                <span className="track-thumb">
                  {t.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.thumb} alt="" loading="lazy" />
                  ) : (
                    <span className="track-thumb-icon">{KIND_ICON[t.kind]}</span>
                  )}
                  <span className="track-thumb-badge">▶</span>
                </span>
                <span className="track-text">
                  {editingId === t.id ? (
                    <input
                      className="field field-sm"
                      value={editValue}
                      autoFocus
                      aria-label="Novo título"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        renameItem(t.id, editValue);
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          renameItem(t.id, editValue);
                          setEditingId(null);
                          sound.confirm();
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <span className="track-title">{t.title}</span>
                  )}
                  <span className="track-url">
                    {KIND_LABEL[t.kind]}
                    {t.local && " · só nesta sessão"}
                    {saved && saved.t > 5 && ` · parou em ${fmtTime(saved.t)}`}
                    {inDecks.length > 0 && ` · no canal ${inDecks.map((d) => d.label).join(", ")}`}
                  </span>
                </span>
              </button>

              <div className="track-actions">
                {decks.length > 1 &&
                  decks.map((d) => (
                    <SoundButton
                      key={d.id}
                      variant="pill"
                      className="deck-send"
                      title={`Tocar no canal ${d.label}`}
                      aria-label={`Tocar ${t.title} no canal ${d.label}`}
                      active={d.itemId === t.id}
                      onClick={() => onPlay(d.id, t.id)}
                    >
                      ▶ {d.label}
                    </SoundButton>
                  ))}
                <SoundButton
                  variant="icon"
                  title="Subir na lista"
                  aria-label={`Subir ${t.title}`}
                  disabled={i === 0 || filter !== ""}
                  onClick={() => moveItem(t.id, -1)}
                >
                  ↑
                </SoundButton>
                <SoundButton
                  variant="icon"
                  title="Descer na lista"
                  aria-label={`Descer ${t.title}`}
                  disabled={i === visible.length - 1 || filter !== ""}
                  onClick={() => moveItem(t.id, 1)}
                >
                  ↓
                </SoundButton>
                <SoundButton
                  variant="icon"
                  title="Renomear"
                  aria-label={`Renomear ${t.title}`}
                  onClick={() => {
                    setEditingId(t.id);
                    setEditValue(t.title);
                  }}
                >
                  ✎
                </SoundButton>
                <SoundButton
                  variant="danger"
                  sfx="reject"
                  title="Remover da biblioteca"
                  aria-label={`Remover ${t.title}`}
                  onClick={() => removeItem(t.id)}
                >
                  ✕
                </SoundButton>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
