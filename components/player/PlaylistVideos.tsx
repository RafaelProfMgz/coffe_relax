"use client";

import { useId } from "react";
import { youTubeThumb } from "@/lib/media-sources";
import type { PlaylistVideo } from "@/lib/youtube-playlist";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

interface Props {
  videos: PlaylistVideo[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onLoadMore: () => void;
  onRetry: () => void;
  currentIndex?: number;
  ready: boolean;
  error?: string;
  onPlay: (index: number, videoId: string) => void;
}

export default function PlaylistVideos({ videos, total, hasMore, loading, query, onQueryChange, onLoadMore, onRetry, currentIndex, ready, error, onPlay }: Props) {
  const searchId = useId();
  const search = normalize(query.trim());
  const visible = videos.filter((video) => normalize(video.title).includes(search));

  return (
    <section className="deck-playlist" aria-label="Vídeos da playlist">
      <div className="deck-playlist-head">
        <h3>Vídeos da playlist</h3>
        <span className="badge">{search ? `${visible.length} de ${total}` : `${videos.length} de ${total}`}</span>
      </div>
      <label className="deck-playlist-search" htmlFor={searchId}>Buscar vídeo pelo nome</label>
      <input
        id={searchId}
        className="field"
        type="search"
        placeholder="Buscar vídeo pelo nome…"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <p className="deck-playlist-status" role="status">
        {loading ? search ? "Buscando nas páginas da playlist…" : "Carregando vídeos da playlist…"
          : error ? error
          : hasMore ? `${videos.length} de ${total} vídeos carregados`
          : `${visible.length} ${visible.length === 1 ? "vídeo disponível" : "vídeos disponíveis"}`}
      </p>
      {error && <button type="button" className="link-btn" onClick={onRetry}>Tentar novamente</button>}
      {!loading && !hasMore && !error && visible.length === 0 && <p className="empty-note">Nenhum vídeo encontrado com esse nome.</p>}
      <ul
        className="playlist deck-playlist-videos"
        aria-label="Selecionar vídeo da playlist"
        aria-busy={loading}
        onScroll={(event) => {
          const list = event.currentTarget;
          if (list.scrollHeight - list.scrollTop - list.clientHeight < 120) onLoadMore();
        }}
      >
        {visible.map((video) => (
          <li key={`${video.index}-${video.id}`} className={`track ${video.index === currentIndex ? "is-current" : ""}`}>
            <button
              type="button"
              className="track-main"
              disabled={!ready}
              aria-current={video.index === currentIndex ? "true" : undefined}
              aria-label={`Tocar vídeo ${video.index + 1}: ${video.title}`}
              onClick={() => onPlay(video.index, video.id)}
            >
              <span className="track-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={youTubeThumb(video.id)} alt="" loading="lazy" />
                <span className="track-thumb-badge" aria-hidden>▶</span>
              </span>
              <span className="track-text">
                <span className="track-title" title={video.title}>{video.title}</span>
                <span className="track-url">Vídeo {video.index + 1}{video.index === currentIndex ? " · selecionado" : ""}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {hasMore && !error && (
        <button type="button" className="link-btn" disabled={loading} onClick={onLoadMore}>
          {loading ? "Carregando…" : "Carregar mais vídeos"}
        </button>
      )}
    </section>
  );
}
