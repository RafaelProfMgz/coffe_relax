"use client";

import { useCallback, useState } from "react";
import SoundButton from "@/components/ui/SoundButton";
import Deck from "@/components/player/Deck";
import MediaLibrary from "@/components/player/MediaLibrary";
import { MAX_DECKS, useMediaLibrary } from "@/hooks/useMediaLibrary";

/**
 * Vários canais tocando juntos, cada um com seu volume — um audiobook num,
 * uma música no outro — alimentados pela mesma biblioteca de links.
 */
export function useMediaStation() {
  const lib = useMediaLibrary();
  // contador por canal: cada pedido de "tocar" muda o número e o canal reage
  const [requests, setRequests] = useState<Record<string, number>>({});

  const playOn = useCallback(
    (deckId: string, itemId: string) => {
      lib.updateDeck(deckId, { itemId });
      setRequests((r) => ({ ...r, [deckId]: (r[deckId] ?? 0) + 1 }));
    },
    [lib]
  );

  return { ...lib, requests, playOn };
}

type Station = ReturnType<typeof useMediaStation>;

export function DeckBoard({ station }: { station: Station }) {
  const { decks, items, requests, playOn, updateDeck, removeDeck, addDeck, getProgress, saveProgress } = station;
  const playing = decks.filter((d) => d.itemId).length;

  return (
    <section className="panel" aria-label="Canais de reprodução">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Canais</h2>
          <p className="panel-sub">Cada canal toca uma coisa, com seu próprio volume. Misture à vontade.</p>
        </div>
        <span className="badge">
          {playing}/{decks.length} em uso
        </span>
      </header>

      <div className="deck-grid">
        {decks.map((d) => (
          <Deck
            key={d.id}
            deck={d}
            item={items.find((i) => i.id === d.itemId) ?? null}
            items={items}
            playRequest={requests[d.id] ?? 0}
            canRemove={decks.length > 1}
            onUpdate={(patch) => updateDeck(d.id, patch)}
            onPlayItem={(itemId) => playOn(d.id, itemId)}
            onRemove={() => removeDeck(d.id)}
            getProgress={getProgress}
            saveProgress={saveProgress}
          />
        ))}
      </div>

      {decks.length < MAX_DECKS && (
        <div className="deck-add">
          <SoundButton variant="outline" sfx="confirm" onClick={addDeck}>
            + novo canal
          </SoundButton>
        </div>
      )}
    </section>
  );
}

export function LibraryPanel({ station }: { station: Station }) {
  return (
    <MediaLibrary
      items={station.items}
      decks={station.decks}
      hydrated={station.hydrated}
      addLink={station.addLink}
      addFile={station.addFile}
      removeItem={station.removeItem}
      renameItem={station.renameItem}
      moveItem={station.moveItem}
      getProgress={station.getProgress}
      onPlay={station.playOn}
    />
  );
}
