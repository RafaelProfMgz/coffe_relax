import { fetchPlaylistPage } from "@/lib/youtube-playlist-server";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const list = params.get("list") ?? "";
  const cursor = params.get("cursor");
  if (!/^[\w-]{10,100}$/.test(list) || (cursor && cursor.length > 20000)) {
    return Response.json({ error: "Playlist ou cursor inválido." }, { status: 400 });
  }
  try {
    return Response.json(await fetchPlaylistPage(list, cursor), { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível carregar a playlist." }, { status: 502 });
  }
}
