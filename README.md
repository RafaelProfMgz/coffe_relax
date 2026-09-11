# coffe to relax

> *"Um refúgio administrativo com som de chuva, teclas mecânicas e cheiro de café recém-passado."*

![Status](https://img.shields.io/badge/Status-Pronto_Next.js-98971a?style=flat-square)
![Tech](https://img.shields.io/badge/Tech-Next.js_14_+_TypeScript_+_Web_Audio-48727a?style=flat-square)
![Estética](https://img.shields.io/badge/Estética-Papel_&_Café_Torrado-f7f0e2?style=flat-square&labelColor=efe4cf&color=c65a1e)

## Sobre o Projeto

O **coffe to relax** (evolução do `~/.vim/cafe.rc`) nasceu de uma necessidade simples: ter um espaço digital que não gritasse urgência. Vivemos em painéis administrativos frios, estéreis e estressantes. Este projeto propõe o oposto — uma **Central Administrativa Pessoal** com estética de cafeteria e som de chuva. 

Atualmente, ele funciona como um ambiente de foco e relaxamento (um *ASMR board* interativo com notas autoadesivas). No entanto, **a visão de longo prazo é evoluir esta interface para uma Central Administrativa completa e conectada**. 

Imagine gerenciar sua agenda, ler emails, organizar tarefas e monitorar métricas em um painel que te faz sentir como se estivesse em uma cafeteria em uma tarde chuvosa de outono. Produtividade através da calmaria.

## A Estética: Papel & Café Torrado

A paleta foi escolhida para não cansar os olhos: pergaminho envelhecido, marrons quentes e um laranja de outono como único destaque. Tudo é definido em *design tokens* CSS, e o **Modo Noite** troca os tokens por uma versão escura e igualmente quente — nada de azul frio.

| Token | Claro | Noite | Uso |
| :--- | :--- | :--- | :--- |
| `--paper` | `#f7f0e2` | `#211c19` | Fundo principal, com textura de papel |
| `--surface` | `#fffaf0` | `#2b2521` | Painéis e cartões |
| `--ink` | `#362f28` | `#f0e5d4` | Texto |
| `--accent` | `#c65a1e` | `#e8843f` | Destaques, play, toggles ativos |
| `--green` | `#6f7a34` | `#a3ad5f` | Licenças abertas e confirmações |

## Funcionalidades Atuais

*   🎵 **Playlist do YouTube (localStorage):** Cole o link, o **título é buscado automaticamente** (oEmbed) e link + título ficam salvos no navegador. Player completo com *play/pause*, **avançar, voltar, pular direto para a faixa escolhida**, barra de progresso, volume próprio, aleatório, repetição (off / tudo / uma), modo só-áudio, renomear e reordenar.
*   🎚️ **Mesa de Ambiente:** 10 camadas sonoras sintetizadas ao vivo — chuva, trovão, mar, floresta, lareira, cafeteria, vento, grilos, tigela tibetana e vinil lo-fi. Todas **tocam simultaneamente**, cada uma com seu próprio *slider*, mais 5 combinações prontas. Zero download, zero CORS, zero licença.
*   📚 **Bibliotecas Públicas:** Atalhos curados para **Freesound** (CC0/CC-BY), **Pixabay Sound Effects** (livre para uso comercial, sem créditos), **Musopen** (clássico em domínio público), Internet Archive e Openverse — cada um com o tipo de licença em destaque.
*   ☕ **Sons de interface "gostosinhos":** Cliques híbridos de kalimba com tecla mecânica — transiente de ruído filtrado, corpo senoidal afinado e reverb de sala pequena. Os cliques caminham por uma **escala pentatônica**, então clicar rápido vira melodia em vez de ruído.
*   ⌨️ **Teclado Vim-style:** `h`, `j`, `k`, `l`, `w`, `b` e `[espaço]` fora das caixas de texto tocam notas afinadas.
*   📝 **Mural de Notas:** Notas autoadesivas com arraste (Pointer Events), cores, texto e posição salvos no `localStorage`.
*   ⏱️ **Pomodoro:** Anel de progresso animado, contagem de ciclos e tigela tibetana no fim de cada bloco.
*   🌤️ **Clima real:** Open-Meteo com geolocalização (cai em São Paulo se você negar a permissão).
*   🌙 **Modo Noite:** Troca completa de tema, persistida entre sessões.
*   🍪 **Consentimento de verdade:** Banner na primeira visita com categorias separadas (necessário / preferências / localização). **Nada é gravado no navegador antes do aceite** — e o botão *apagar meus dados* limpa tudo na hora. Reabra as escolhas pelo rodapé quando quiser.
*   📍 **Localização só com permissão dupla:** O clima carrega São Paulo por padrão. Para usar a sua posição, você autoriza aqui no site **e** no pedido do próprio navegador — com botão de revogar no card.
*   🔒 **Zero rastreamento por construção:** Sem analytics, sem pixels, sem cookies de publicidade. As fontes são servidas pelo próprio domínio (`next/font`) e o player usa `youtube-nocookie.com`.
*   📄 **Páginas legais:** [Termos de Serviço](/termos) e [Política de Privacidade](/privacidade) escritas em português claro, com tabela do que é guardado e como exercer direitos da LGPD/GDPR.
*   🔎 **SEO completo:** Metadata API do Next (canonical, Open Graph, Twitter Card, keywords, robots), **JSON-LD** (`WebApplication` + `WebSite`), `sitemap.xml`, `robots.txt`, `llms.txt`, Web App Manifest e imagem de compartilhamento + favicons **gerados em build** com `next/og`.
*   🎨 **Ícone próprio:** Xícara com vapor desenhado em ondas — lê como fumaça de café e como onda sonora ao mesmo tempo. SVG vetorial para o navegador, PNG para o iOS.
*   ♿ **Acessível e responsivo:** Rótulos ARIA, foco visível, `prefers-reduced-motion` e layout que desce para uma coluna no celular.

## O Futuro: A Central Administrativa Pessoal

O ambiente relaxante de hoje é a fundação para o *dashboard* de amanhã. O roteiro de atualizações transformará o **cafe.rc** no seu principal hub de produtividade:

- [ ] **Sincronização em Nuvem (Firebase):** Sistema de login e autenticação seguro. Suas notas e configurações não ficarão mais presas ao navegador.
- [ ] **Agenda Zen (Integração Google Calendar):** Visualize seus compromissos e planeje seu dia sem sair do seu refúgio.
- [ ] **Caixa de Entrada Calma (Integração Gmail):** Conexão com sua conta de email para ler mensagens essenciais em uma interface minimalista.
- [x] **Card de Clima Atmosférico:** Um *widget* mostrando o clima real da sua cidade com a estética do terminal.
- [x] **Módulo Pomodoro:** Um *timer* integrado de forma discreta na *mode-line* do Vim, intercalando momentos de foco com pausas para o café.
- [ ] **Comandos Reais no Terminal:** Fazer o log inferior ganhar vida aceitando *inputs* reais (`:clear`, `:focus`, `:new-note`, `:login`).

## Privacidade e SEO

| Rota | O que é |
| :--- | :--- |
| `/termos` | Termos de Serviço |
| `/privacidade` | Política de Privacidade (LGPD/GDPR) |
| `/sitemap.xml` | Sitemap gerado por `app/sitemap.ts` |
| `/robots.txt` | Regras de rastreamento, gerado por `app/robots.ts` |
| `/llms.txt` | Resumo do site para agentes de IA, no padrão [llmstxt.org](https://llmstxt.org) |
| `/manifest.webmanifest` | Web App Manifest (instalável) |
| `/opengraph-image` | Imagem 1200×630 de compartilhamento, gerada em build |
| `/icon.svg` | Ícone próprio — xícara com vapor em ondas (nítido em qualquer tamanho) |
| `/apple-icon` | Mesma arte rasterizada em PNG 180×180 para o iOS |

### Páginas de estado

| Arquivo | Quando aparece |
| :--- | :--- |
| `app/not-found.tsx` | Rota inexistente — responde **HTTP 404** de verdade e com `noindex` |
| `app/error.tsx` | Erro de renderização numa rota, com botão *tentar de novo* (`reset()`) |
| `app/global-error.tsx` | Falha no próprio root layout — self-contained, só estilo inline |
| `app/loading.tsx` | Transição de rota, com a barra de "passando o café" |

### Antes de publicar

1. Defina o domínio real (sem barra no final) — veja `.env.example`:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
   ```
   Ele alimenta canonical, sitemap, robots, Open Graph e JSON-LD de uma vez só.
2. Troque o e-mail de contato das páginas legais em `lib/site.ts` (`SITE.contactEmail`).
3. Revise `SITE.legalUpdatedAt` sempre que alterar os termos ou a política.

> Os textos legais descrevem com honestidade como o projeto funciona e foram escritos para serem lidos por pessoas — para uso comercial, vale a revisão de um advogado.

## Como usar — Next.js App Router

O projeto é uma aplicação **Next.js 14** (App Router, TypeScript, Web Audio API). Requer `node` e `npm`.

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/coffe-to-relax.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra `http://localhost:3000`, escolha suas preferências de privacidade, clique na tela para moer os grãos e aproveite o **coffe to relax**.

Para produção:
```bash
npm run build
npm start
```

---

<p align="center">
  <i>"Puxe uma cadeira, escute a chuva e digite com calma."</i><br>
</p>

---
