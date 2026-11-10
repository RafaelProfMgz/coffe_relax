"use client";

import { useCallback, useEffect, useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { playlistPageKey, type PlaylistPage } from "@/lib/youtube-playlist";

async function fetchPage(url: string): Promise<PlaylistPage> {
  const response = await fetch(url);
  const page = await response.json();
  if (!response.ok) throw new Error(page.error || "Não foi possível carregar os vídeos.");
  return page;
}

export function usePlaylistVideos(playlistId: string | null, query: string, currentIndex?: number) {
  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<PlaylistPage>(
    (index, previous) => playlistId ? playlistPageKey(playlistId, index, previous) : null,
    fetchPage,
    { revalidateFirstPage: false, revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false, persistSize: false },
  );
  const videos = useMemo(() => data?.flatMap((page) => page.videos) ?? [], [data]);
  const last = data?.[data.length - 1];
  const hasMore = Boolean(last?.nextCursor);
  const loading = Boolean(playlistId) && (!data && !error || isValidating || Boolean(data && size > data.length && !error));
  const loadMore = useCallback(() => {
    if (hasMore && !loading && !error) void setSize(size + 1);
  }, [hasMore, loading, error, setSize, size]);

  useEffect(() => {
    // A busca percorre toda a playlist; tocar perto do fim antecipa a próxima página.
    if (query.trim() || (currentIndex !== undefined && currentIndex >= videos.length - 5)) loadMore();
  }, [query, currentIndex, videos.length, loadMore]);

  return { videos, total: data?.[0]?.total ?? 0, hasMore, loading, error: error as Error | undefined, loadMore, retry: () => void mutate() };
}
