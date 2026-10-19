import { SITE, SITE_PAGES, absoluteUrl } from "@/lib/site";
import { source } from "@/lib/source";

// Resumo do site para agentes de IA (llmstxt.org). Gerado no build, com o domínio da configuração.
export const dynamic = "force-static";

export function GET() {
  const pages = SITE_PAGES.filter((p) => p.href !== "/docs")
    .map((p) => `- [${p.label}](${absoluteUrl(p.href)})`)
    .join("\n");
  const docs = source
    .getPages()
    .map((p) => `- [${p.data.title}](${absoluteUrl(p.url)}): ${p.data.description ?? ""}`)
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.tagline}. Ambiente de foco que roda inteiramente no navegador: sons relaxantes sintetizados ao vivo
> com a Web Audio API e até quatro players tocando juntos (YouTube, Spotify, links de áudio e arquivos locais),
> com biblioteca de links salva no localStorage. Sem contas, sem anúncios, sem rastreamento.

O projeto é open source (${SITE.repo}), escrito em Next.js com TypeScript. Todo o conteúdo do usuário
(biblioteca de links, posições de reprodução, preferências) fica no armazenamento local do próprio
navegador — não existe banco de dados. O uso do localStorage depende de consentimento explícito, pedido na
primeira visita e revogável a qualquer momento pelo rodapé.

## Recursos principais

- [Mesa de Ambiente](${absoluteUrl("/docs/mesa-de-ambiente")}): dez camadas de som sintetizadas ao vivo — chuva, trovão, mar, floresta, lareira, cafeteria, vento, noite, tigela tibetana e vinil lo-fi — com volume próprio e cinco misturas prontas.
- [Players e canais](${absoluteUrl("/docs/playlist")}): até quatro canais simultâneos, cada um com volume e rótulo próprios (Música, Audiobook, Podcast). Aceita vídeos e playlists do YouTube (via youtube-nocookie.com), Spotify (faixa, álbum, playlist, artista, episódio, show e audiobook, pelo player oficial embutido), links diretos de áudio e arquivos locais, que não saem do navegador. Títulos via oEmbed do YouTube e do Spotify; itens com 10 minutos ou mais retomam de onde pararam; velocidade de 0,75× a 2× no YouTube e no áudio direto.
- [Teclado do Café](${absoluteUrl("/docs/atalhos")}): notas de uma escala pentatônica nas teclas h j k l w b e espaço.

## Documentação

${docs}

## Páginas

${pages}
- [Código-fonte](${SITE.repo})

## Observações para agentes

- O app é client-side; a única API pública é ${absoluteUrl("/api/status")} (versão e saúde do site).
- Não há conteúdo pago, muro de login ou área restrita.
- O idioma principal é português do Brasil.
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
