---
name: vercel
description: Fluxo de deploy e operação na Vercel para o coffe to relax — produção só via git (merge na main), CLI apenas para preview, variáveis de ambiente, domínio coffe.lotmhub.com.br e configuração do projeto. Use ao falar de deploy, preview, env vars, domínio, logs ou vercel.json.
---

# Vercel — coffe to relax

## Regra principal: produção sai pelo git

- **Nunca** rode `vercel --prod`, `vercel deploy --prod`, `vercel promote` ou qualquer comando que publique em produção pela CLI.
- Produção = merge na `main` no GitHub (o fluxo atual é `develop` → PR → `main`).
- A CLI serve só para **preview e teste**: `vercel` (deploy de preview), `vercel dev`, `vercel logs`, `vercel env`.

## Domínios

- Produção: `https://coffe.lotmhub.com.br`.
- `coffe-relax.vercel.app` redireciona (301) para o domínio próprio em `next.config.ts`. Previews têm outros hosts e não são afetados — não remova esse `has: host`.
- `NEXT_PUBLIC_SITE_URL` deve bater com o domínio do ambiente (sem barra final).

## Variáveis de ambiente

| Variável | Onde | Observação |
| :-- | :-- | :-- |
| `NEXT_PUBLIC_SITE_URL` | todos | canonical, sitemap, OG |
| `NEXT_PUBLIC_CONTACT_EMAIL` | todos | opcional |
| `RESEND_API_KEY` | production/preview | segredo; sem ela o contato mostra só o e-mail |
| `CONTACT_FROM` | production/preview | remetente de domínio verificado no Resend |

```bash
vercel env ls
vercel env pull .env.local      # sincroniza para o dev local
vercel env add NOME preview
```

Toda variável nova também entra no `.env.example`. Nunca commite `.env*` (exceto o example).

## Configuração

- `vercel.json` hoje só declara `framework: nextjs`. Se precisar de headers, crons ou rewrites, prefira migrar para `vercel.ts` (`@vercel/config`).
- Runtime: Node.js 24 padrão (Fluid Compute). Não use Edge runtime.
- Limite de corpo de request/response: 4.5 MB.

## Diagnóstico

```bash
vercel ls                        # deploys recentes
vercel inspect <url>             # detalhes do build
vercel logs <url>                # logs de runtime
```

Para deploys protegidos, use a skill `vercel:access-protected-vercel-deployment`. Para detalhes de CLI, `vercel:vercel-cli`.
