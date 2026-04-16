# ~/.vim/cafe.rc

> *"Um refúgio administrativo com som de chuva, teclas mecânicas e cheiro de café recém-passado."*

![Gruvbox Theme](https://img.shields.io/badge/Tema-Gruvbox_Light_Hard-f9f5d7?style=flat-square&logoColor=3c3836&labelColor=ebdbb2&color=d5c4a1)
![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-98971a?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla_JS_%2B_Tone.js-d65d0e?style=flat-square)

## Sobre o Projeto

O **~/.vim/cafe.rc** (ou *relax.rc*) nasceu de uma necessidade simples: ter um espaço digital que não gritasse urgência. Vivemos em painéis administrativos frios, estéreis e estressantes. Este projeto propõe o oposto. 

Atualmente, ele funciona como um ambiente de foco e relaxamento (um *ASMR board* interativo com notas autoadesivas). No entanto, **a visão de longo prazo é evoluir esta interface para uma Central Administrativa completa e conectada**. 

Imagine gerenciar sua agenda, ler emails, organizar tarefas e monitorar métricas em um painel que te faz sentir como se estivesse em uma cafeteria em uma tarde chuvosa de outono. Produtividade através da calmaria.

## A Estética: Gruvbox Light (Hard)

A paleta de cores foi rigorosamente escolhida para não cansar os olhos. O tema **Gruvbox Light Hard** traz um contraste suave, com tons de pergaminho antigo, marrons quentes e cores de destaque pastéis e terrosas.

| Cor | Hex | Uso |
| :--- | :--- | :--- |
| **Bg Hard** | `#f9f5d7` | O fundo principal (cor de papel amarelado/café com leite) |
| **Bg0 / Bg1**| `#fbf1c7` / `#ebdbb2` | Elementos em destaque, painéis e teclas |
| **Fg (Texto)**| `#3c3836` | Contraste macio para leitura |
| **Green** | `#98971a` | Sucesso, botões primários e logs positivos |
| **Orange** | `#d65d0e` | Destaques, *Spacebar* e *Toggles* ativos |

## Funcionalidades Atuais

*   🎧 **Motor de Áudio Híbrido (Tone.js + Web Audio API):** Uma mistura de áudio gerado proceduralmente (cliques de interface, *pops*, *swooshes* e *thocks* de teclado mecânico) com imersão realista.
*   🌧️ **Sons da Natureza e Ambientação:** *Toggles* nativos para ligar som de Chuva e de Rio (utilizando áudios reais `.ogg` de alta qualidade), além de um filtro *Lo-Fi* estilo fita cassete gerado via ruído rosa sintético.
*   ⌨️ **Mapeamento Real de Teclado (Vim-style):** Digitar `h`, `j`, `k`, `l`, `w`, `b` e `[Space]` fora das caixas de texto aciona visualmente e sonoramente os botões na tela, gerando notas musicais.
*   📝 **Smart Notes Personalizáveis:** Crie notas autoadesivas pela tela. O sistema detecta as cores já usadas da paleta pastel, mas agora você também pode escolher **qualquer cor customizada** usando o *Color Picker* embutido no rodapé de cada nota.
*   💾 **Persistência Local (Auto-Save):** Fechou a aba? Suas notas, posições (`x/y`), textos e cores customizadas estarão exatamente onde você as deixou graças ao `localStorage`.
*   🧘 **Modo Foco:** Escurece levemente a tela, esconde distrações (notas e botões flutuantes) e centraliza sua atenção apenas no terminal e nos controles ambientais.

## O Futuro: A Central Administrativa Pessoal

O ambiente relaxante de hoje é a fundação para o *dashboard* de amanhã. O roteiro de atualizações transformará o **cafe.rc** no seu principal hub de produtividade:

- [ ] **Sincronização em Nuvem (Firebase):** Sistema de login e autenticação seguro. Suas notas e configurações não ficarão mais presas ao navegador.
- [ ] **Agenda Zen (Integração Google Calendar):** Visualize seus compromissos e planeje seu dia sem sair do seu refúgio.
- [ ] **Caixa de Entrada Calma (Integração Gmail):** Conexão com sua conta de email para ler mensagens essenciais em uma interface minimalista.
- [ ] **Card de Clima Atmosférico:** Um *widget* mostrando o clima real da sua cidade com a estética do terminal.
- [ ] **Módulo Pomodoro:** Um *timer* integrado de forma discreta na *mode-line* do Vim, intercalando momentos de foco com pausas para o café.
- [ ] **Comandos Reais no Terminal:** Fazer o log inferior ganhar vida aceitando *inputs* reais (`:clear`, `:focus`, `:new-note`, `:login`).

## Como usar

Como o projeto é construído 100% em **Vanilla HTML/CSS/JS** (com *Tone.js* importado via CDN), não há necessidade de *build*, Node.js ou bundlers.

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/vim-cafe-rc.git
   ```
2. Abra a pasta do projeto.
3. Dê um duplo clique no arquivo `index.html` para abrir no seu navegador.
4. *Ligue os fones, clique na tela para compilar os grãos, e relaxe.*

---

<p align="center">
  <i>"Puxe uma cadeira, escute a chuva e digite com calma."</i><br>
</p>

---
