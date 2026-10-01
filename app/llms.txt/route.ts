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
> com a Web Audio API, playlist do YouTube salva no localStorage, timer pomodoro, mural de notas e card de
> clima. Sem contas, sem anúncios, sem rastreamento.

O projeto é open source (${SITE.repo}), escrito em Next.js com TypeScript. Todo o conteúdo do usuário
(playlist, notas, preferências) fica no armazenamento local do próprio navegador — não existe banco de
dados. O uso do localStorage e da geolocalização depende de consentimento explícito, pedido na primeira
visita e revogável a qualquer momento pelo rodapé.

## Recursos principais

- [Mesa de Ambiente](${absoluteUrl("/docs/mesa-de-ambiente")}): dez camadas de som sintetizadas ao vivo — chuva, trovão, mar, floresta, lareira, cafeteria, vento, noite, tigela tibetana e vinil lo-fi — com volume próprio e cinco misturas prontas.
- [Playlist do YouTube](${absoluteUrl("/docs/playlist")}): o usuário cola um link, o título é buscado pelo oEmbed público e a lista fica no navegador. Player pelo domínio youtube-nocookie.com.
- [Pomodoro](${absoluteUrl("/docs/pomodoro")}), [mural de notas](${absoluteUrl("/docs/mural-de-notas")}) e [clima](${absoluteUrl("/docs/clima")}) via Open-Meteo.

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
