---
name: docker
description: Como containerizar e rodar o coffe to relax com Docker — Dockerfile multi-stage com output standalone do Next.js 16, docker-compose para dev, .dockerignore e variáveis de ambiente em build vs runtime. Use ao criar ou alterar Dockerfile, docker-compose, imagens ou ao rodar o app em container.
---

# Docker — coffe to relax

O deploy oficial é na Vercel (ver skill `vercel`). Docker é para rodar localmente isolado, self-hosting ou CI.

## Pré-requisito: output standalone

Adicione em `next.config.ts` (não afeta a Vercel):

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  // ...resto
};
```

## Dockerfile (produção, multi-stage)

```dockerfile
# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* é embutido no bundle no build — precisa vir como build arg
ARG NEXT_PUBLIC_SITE_URL=https://coffe.lotmhub.com.br
ARG NEXT_PUBLIC_CONTACT_EMAIL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public   # descomente se criar public/
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Notas:
- O Fumadocs gera `.source` no build — ele precisa acontecer dentro da imagem (por isso `COPY . .` antes do build e `.source` no `.dockerignore`).
- Segredos (`RESEND_API_KEY`, `CONTACT_FROM`) entram **em runtime** (`-e` / `env_file`), nunca como `ARG`.

## .dockerignore

```
node_modules
.next
.source
.vercel
.git
.env
.env.*
!.env.example
*.log
Dockerfile*
docker-compose*
```

## docker-compose (dev com hot reload)

```yaml
services:
  web:
    image: node:24-alpine
    working_dir: /app
    command: sh -c "npm ci && npm run dev -- -H 0.0.0.0"
    ports: ["3000:3000"]
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    env_file: .env.local
    environment:
      WATCHPACK_POLLING: "true"
```

## Comandos

```bash
docker build -t coffe-relax --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 .
docker run --rm -p 3000:3000 --env-file .env.local coffe-relax
docker compose up
```

## Checklist

1. Imagem final roda como usuário não-root.
2. `npm ci` com lockfile (nunca `npm install` na imagem).
3. Nenhum segredo em camada de build (`docker history` limpo).
4. `curl -I localhost:3000` retorna 200 e `/docs` carrega.
