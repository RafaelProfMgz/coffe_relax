---
name: nextjs
description: Convenções de Next.js 16 (App Router) neste projeto — route groups (site) e (docs) com layouts raiz separados, Server vs Client Components, metadata/SEO, Fumadocs MDX, rotas de API e variáveis de ambiente. Use ao criar páginas, rotas, layouts, server actions ou mexer em next.config.ts.
---

# Next.js — coffe to relax

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Fumadocs para `/docs`. Node 24.

## Estrutura

- `app/(site)/` — o app principal. Layout raiz próprio, importa `app/globals.css` (CSS puro).
- `app/(docs)/` — documentação Fumadocs, layout raiz próprio com `app/docs.css` (Tailwind). Conteúdo em `content/docs/*.mdx`, fonte em `lib/source.ts`.
- Como existem **dois layouts raiz**, a 404 global vem de `app/global-not-found.tsx` (`experimental.globalNotFound`). Não crie `app/not-found.tsx` na raiz.
- Rotas de metadados: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, `apple-icon.tsx`, `llms.txt/route.ts`. Ao criar página pública nova, inclua-a no `sitemap.ts`.
- Alias `@/*` aponta para a raiz.

## Server vs Client

- Padrão é Server Component. Só use `"use client"` quando precisar de estado, efeitos, eventos, Web Audio, `localStorage` ou APIs do navegador.
- Empurre o `"use client"` para a folha da árvore; a página e o layout continuam server.
- Contextos de cliente ficam em `app/(site)/providers.tsx`.
- Nunca acesse `window`/`localStorage` no render — use efeito ou `lib/storage.ts` (que respeita o consentimento).

## Dados e cache

- Next 16: `params` e `searchParams` são `Promise` — sempre `await`.
- Para cache use as Cache Components (`"use cache"`, `cacheLife`, `cacheTag`) — veja a skill `vercel:next-cache-components` para detalhes. Não use `unstable_cache`.
- Não use `export const runtime = 'edge'`: o runtime padrão Node.js (Fluid Compute) é o recomendado e suporta streaming.

## Mutações e formulários

- Prefira Server Actions para formulários (ex.: contato via `lib/contact.ts` + `lib/email.ts`/Resend).
- Valide no servidor; segredos (`RESEND_API_KEY`) nunca chegam ao cliente.
- Só variáveis `NEXT_PUBLIC_*` ficam visíveis no browser. Documente toda variável nova no `.env.example`.

## SEO

- Use `export const metadata` / `generateMetadata`; `metadataBase` vem de `SITE.url` (`lib/site.ts`). Monte URLs com `absoluteUrl()`.
- Defina `alternates.canonical` em páginas novas. Idioma `pt-BR`.

## Validação

Antes de concluir uma mudança:

```bash
npm run typecheck
npm run build
```

Para debug mais aprofundado do App Router, carregue também a skill `vercel:nextjs`.
