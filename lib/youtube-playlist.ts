export interface PlaylistVideo {
  id: string;
  index: number;
  title: string;
}

export interface PlaylistPage {
  videos: PlaylistVideo[];
  total: number;
  nextCursor: string | null;
}

export function playlistPageKey(playlistId: string, pageIndex: number, previous: PlaylistPage | null) {
  if (pageIndex > 0 && !previous?.nextCursor) return null;
  const params = new URLSearchParams({ list: playlistId });
  if (previous?.nextCursor) params.set("cursor", previous.nextCursor);
  return `/api/youtube/playlist?${params}`;
}
