/**
 * Reconhece os links que os canais sabem tocar e busca título/capa
 * nos endpoints oEmbed públicos (YouTube e Spotify permitem CORS).
 */

export type MediaKind = "youtube" | "youtube-playlist" | "spotify" | "audio";

export interface ParsedSource {
  kind: MediaKind;
  /** videoId, playlistId, URI do Spotify (spotify:album:…) ou a URL do áudio */
  ref: string;
  /** vídeo em que a playlist começa, quando o link traz v= e list= */
  startVideoId?: string;
  /** tipo do item no Spotify (track, album, playlist, episode, show…) */
  spotifyType?: string;
}

export const KIND_LABEL: Record<MediaKind, string> = {
  youtube: "YouTube",
  "youtube-playlist": "Playlist do YouTube",
  spotify: "Spotify",
  audio: "Áudio",
};

export const KIND_ICON: Record<MediaKind, string> = {
  youtube: "▶",
  "youtube-playlist": "☰",
  spotify: "♫",
  audio: "🎧",
};

const SPOTIFY_TYPES = ["track", "album", "playlist", "artist", "episode", "show", "audiobook", "chapter"];
const SPOTIFY_TYPE_LABEL: Record<string, string> = {
  track: "faixa",
  album: "álbum",
  playlist: "playlist",
  artist: "artista",
  episode: "episódio",
  show: "podcast",
  audiobook: "audiobook",
  chapter: "capítulo",
};

const AUDIO_EXT = /\.(mp3|m4a|m4b|aac|ogg|oga|opus|wav|flac|webm)(\?|#|$)/i;
const VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;

function toUrl(raw: string): URL | null {
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
}

function parseYouTube(u: URL): ParsedSource | null {
  const host = u.hostname.replace(/^(www|m|music)\./, "");
  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = u.pathname.slice(1).split("/")[0];
  } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    videoId = u.searchParams.get("v");
    if (!videoId) {
      const parts = u.pathname.split("/").filter(Boolean);
      const marker = parts.findIndex((p) => ["embed", "shorts", "live", "v"].includes(p));
      if (marker !== -1) videoId = parts[marker + 1] ?? null;
    }
  } else {
    return null;
  }

  const list = u.searchParams.get("list");
  const validVideo = videoId && VIDEO_ID.test(videoId) ? videoId : undefined;
  // listas automáticas (RD…, mixes) não carregam pela API de playlists — tocamos só o vídeo
  if (list && /^[a-zA-Z0-9_-]{10,}$/.test(list) && !list.startsWith("RD")) {
    return { kind: "youtube-playlist", ref: list, startVideoId: validVideo };
  }
  return validVideo ? { kind: "youtube", ref: validVideo } : null;
}

function parseSpotify(raw: string, u: URL | null): ParsedSource | null {
  const uri = raw.match(/^spotify:([a-z]+):([a-zA-Z0-9]+)$/);
  if (uri && SPOTIFY_TYPES.includes(uri[1])) {
    return { kind: "spotify", ref: `spotify:${uri[1]}:${uri[2]}`, spotifyType: uri[1] };
  }
  if (!u || u.hostname !== "open.spotify.com") return null;
  // /intl-pt/album/ID e /embed/album/ID também valem
  const parts = u.pathname.split("/").filter((p) => p && !p.startsWith("intl-") && p !== "embed");
  const [type, id] = parts;
  if (!type || !id || !SPOTIFY_TYPES.includes(type) || !/^[a-zA-Z0-9]+$/.test(id)) return null;
  return { kind: "spotify", ref: `spotify:${type}:${id}`, spotifyType: type };
}

/** Aceita YouTube (vídeo, shorts, live, playlist), Spotify (link ou URI) e link direto de áudio. */
export function parseSource(input: string): ParsedSource | null {
  const raw = input.trim();
  if (!raw) return null;
  if (VIDEO_ID.test(raw)) return { kind: "youtube", ref: raw };

  const u = toUrl(raw);
  const spotify = parseSpotify(raw, u);
  if (spotify) return spotify;
  if (!u) return null;

  const yt = parseYouTube(u);
  if (yt) return yt;

  if ((u.protocol === "https:" || u.protocol === "http:") && AUDIO_EXT.test(u.pathname)) {
    return { kind: "audio", ref: u.toString() };
  }
  return null;
}

/** Endereço público do item no Spotify, a partir da URI. */
export function spotifyUrl(uri: string) {
  const [, type, id] = uri.split(":");
  return `https://open.spotify.com/${type}/${id}`;
}

export function spotifyTypeLabel(type?: string) {
  return (type && SPOTIFY_TYPE_LABEL[type]) || "item";
}

export function youTubeThumb(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

async function oembed(endpoint: string): Promise<{ title?: string; thumbnail_url?: string } | null> {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Título e capa do item. Quando falha, o chamador usa o título digitado ou um genérico. */
export async function fetchMeta(source: ParsedSource): Promise<{ title: string | null; thumb: string | null }> {
  if (source.kind === "youtube") {
    const watch = `https://www.youtube.com/watch?v=${source.ref}`;
    const data = await oembed(`https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`);
    return { title: data?.title ?? null, thumb: youTubeThumb(source.ref) };
  }
  if (source.kind === "youtube-playlist") {
    const list = `https://www.youtube.com/playlist?list=${source.ref}`;
    const data = await oembed(`https://www.youtube.com/oembed?url=${encodeURIComponent(list)}&format=json`);
    return {
      title: data?.title ?? null,
      thumb: data?.thumbnail_url ?? (source.startVideoId ? youTubeThumb(source.startVideoId) : null),
    };
  }
  if (source.kind === "spotify") {
    const data = await oembed(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl(source.ref))}`);
    return { title: data?.title ?? null, thumb: data?.thumbnail_url ?? null };
  }
  // áudio direto: o nome do arquivo já é um bom título
  const file = decodeURIComponent(new URL(source.ref).pathname.split("/").pop() ?? "");
  return { title: file.replace(AUDIO_EXT, "").replace(/[-_]+/g, " ").trim() || null, thumb: null };
}

export const fmtTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
};
