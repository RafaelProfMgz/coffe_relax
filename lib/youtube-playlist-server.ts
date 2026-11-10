import type { PlaylistPage, PlaylistVideo } from "@/lib/youtube-playlist";

type Json = { [key: string]: any }; // Os renderers públicos do YouTube têm formatos variáveis.

/** Lê JSON embutido sem executar os scripts da página. */
function embeddedJson(html: string, marker: RegExp): Json {
  for (const match of html.matchAll(marker)) {
    const start = match.index! + match[0].length;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let i = start; i < html.length; i++) {
      const char = html[i];
      if (quoted) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') quoted = false;
      } else if (char === '"') quoted = true;
      else if (char === "{") depth++;
      else if (char === "}" && --depth === 0) {
        const value = JSON.parse(html.slice(start, i + 1));
        if (value.INNERTUBE_CONTEXT || !marker.source.includes("ytcfg")) return value;
        break;
      }
    }
  }
  throw new Error("Não foi possível ler os dados da playlist no YouTube.");
}

function text(value?: Json): string {
  return value?.simpleText ?? value?.content ?? value?.runs?.map((run: Json) => run.text ?? "").join("") ?? "";
}

function find(value: Json | undefined, key: string): Json | undefined {
  if (!value || typeof value !== "object") return;
  if (key in value) return value[key];
  for (const child of Object.values(value)) {
    const result = find(child as Json, key);
    if (result) return result;
  }
}

interface Cursor { list: string; token: string; clientVersion: string; offset: number }

export function parsePlaylistPage(data: Json, list: string, clientVersion: string, offset = 0): PlaylistPage {
  // A continuação externa da seção carrega recomendações; somente a continuação
  // interna da lista pertence à playlist.
  const actions = data.onResponseReceivedActions ?? data.onResponseReceivedEndpoints ?? [];
  let entries: Json[] | undefined;
  for (const action of actions) {
    const append = action.appendContinuationItemsAction ?? action.reloadContinuationItemsCommand;
    if (append?.continuationItems) { entries = append.continuationItems; break; }
  }
  if (!entries) {
    const legacy = find(data.contents, "playlistVideoListRenderer");
    entries = legacy?.contents;
    if (!entries) {
      const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs ?? [];
      const selected = tabs.find((tab: Json) => tab.tabRenderer?.selected)?.tabRenderer;
      const sections = selected?.content?.sectionListRenderer?.contents ?? [];
      entries = sections.find((section: Json) => section.itemSectionRenderer?.contents?.some((entry: Json) => entry.lockupViewModel?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO"))?.itemSectionRenderer.contents;
    }
  }
  if (!entries) throw new Error("A playlist está indisponível ou o YouTube mudou o formato da resposta.");

  const videos: PlaylistVideo[] = [];
  let token: string | undefined;
  for (const entry of entries) {
    const continuation = entry.continuationItemRenderer ?? entry.continuationItemViewModel;
    if (continuation) {
      const command = find(continuation, "continuationCommand");
      token = command?.token ?? find(command, "continuationCommand")?.token;
    }
    const legacy = entry.playlistVideoRenderer;
    const modern = entry.lockupViewModel;
    if (legacy?.videoId) {
      const position = Number(text(legacy.index));
      videos.push({ id: legacy.videoId, index: position > 0 ? position - 1 : offset + videos.length, title: text(legacy.title) || "Vídeo indisponível" });
    } else if (modern?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" && modern.contentId) {
      const endpoint = modern.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint;
      if (endpoint?.playlistId && endpoint.playlistId !== list) continue;
      videos.push({ id: modern.contentId, index: endpoint?.index ?? offset + videos.length, title: text(modern.metadata?.lockupMetadataViewModel?.title) || "Vídeo indisponível" });
    }
  }
  const primary = find(data.sidebar, "playlistSidebarPrimaryInfoRenderer");
  const total = Number(text(primary?.stats?.[0]).replace(/\D/g, "")) || offset + videos.length;
  const cursor: Cursor | null = token ? { list, token, clientVersion, offset: offset + videos.length } : null;
  return { videos, total, nextCursor: cursor ? Buffer.from(JSON.stringify(cursor)).toString("base64url") : null };
}

export async function fetchPlaylistPage(list: string, encodedCursor: string | null): Promise<PlaylistPage> {
  const options = { signal: AbortSignal.timeout(20000), headers: { "Accept-Language": "pt-BR,pt;q=0.9" }, next: { revalidate: 300 } };
  if (!encodedCursor) {
    const response = await fetch(`https://www.youtube.com/playlist?list=${list}&hl=pt-BR`, options);
    if (!response.ok) throw new Error("Não foi possível consultar a playlist no YouTube.");
    const html = await response.text();
    const data = embeddedJson(html, /(?:var ytInitialData\s*=\s*|window\["ytInitialData"\]\s*=\s*)(?=\{)/g);
    const config = embeddedJson(html, /ytcfg\.set\((?=\{)/g);
    return parsePlaylistPage(data, list, config.INNERTUBE_CONTEXT.client.clientVersion);
  }
  let cursor: Cursor;
  try {
    cursor = JSON.parse(Buffer.from(encodedCursor, "base64url").toString());
    if (cursor.list !== list || typeof cursor.token !== "string" || !cursor.token || cursor.token.length > 12000 || typeof cursor.clientVersion !== "string" || !/^[\w.]+$/.test(cursor.clientVersion) || !Number.isSafeInteger(cursor.offset) || cursor.offset < 0) throw new Error();
  } catch { throw new Error("Cursor de paginação inválido."); }
  const response = await fetch("https://www.youtube.com/youtubei/v1/browse?prettyPrint=false", {
    ...options,
    method: "POST",
    headers: { ...options.headers, "Content-Type": "application/json" },
    body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion: cursor.clientVersion, hl: "pt-BR", gl: "BR" } }, continuation: cursor.token }),
  });
  if (!response.ok) throw new Error("Não foi possível carregar a próxima página da playlist.");
  return parsePlaylistPage(await response.json(), list, cursor.clientVersion, cursor.offset);
}
