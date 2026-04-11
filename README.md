# ~/.vim/cafe.rc

> *"Um refúgio administrativo com som de chuva, teclas mecânicas e cheiro de café recém-passado."*


## Sobre o Projeto

O **~/.vim/cafe.rc** nasceu de uma necessidade simples: ter um espaço digital que não gritasse urgência. Vivemos em painéis administrativos frios, estéreis e estressantes. Este projeto propõe o oposto. 

Atualmente, ele funciona como um ambiente de foco e relaxamento (um ASMR board interativo com notas autoadesivas). No entanto, **a visão de longo prazo é evoluir esta interface para uma Central Administrativa completa**. 

Imagine gerenciar servidores, ler logs, organizar tarefas e monitorar métricas em um painel que te faz sentir como se estivesse em uma cafeteria em uma tarde chuvosa de outono. Produtividade através da calmaria.

## A Estética: Gruvbox Light (Hard)

A paleta de cores foi rigorosamente escolhida para não cansar os olhos. O tema **Gruvbox Light Hard** traz um contraste suave, com tons de pergaminho antigo, marrons quentes e cores de destaque pastéis e terrosas.

| Cor | Hex | Uso |
| :--- | :--- | :--- |
| **Bg Hard** | `#f9f5d7` | O fundo principal (cor de papel amarelado/café com leite) |
| **Bg0 / Bg1**| `#fbf1c7` / `#ebdbb2` | Elementos em destaque, painéis e teclas |
| **Fg (Texto)**| `#3c3836` | Contraste macio para leitura |
| **Green** | `#98971a` | Sucesso, botões primários e logs positivos |
| **Orange** | `#d65d0e` | Destaques, Spacebar e Toggles ativos |

## Funcionalidades Atuais

*   Motor de Áudio Dinâmico (Tone.js & Vanilla Web Audio): Sons gerados proceduralmente. Cliques de interface, pops, swooshes e o som tátil e aveludado de switches mecânicos (thock).
*   Gerador de Ruído Branco: Toggles nativos para ligar som de chuva e estética de fita cassete (Lo-fi), gerados via síntese de áudio (sem arquivos pesados de mp3).
*   Smart Notes em Tons Pastéis: Crie notas autoadesivas pela tela. O sistema detecta as cores já usadas e sempre tenta gerar uma nova nota com uma cor inédita da paleta. Arraste, solte, mude a cor e escreva.
*   Persistência Local: Fechou a aba? Suas notas, posições, textos e cores estarão exatamente onde você as deixou (via `localStorage`).
*   Modo Foco: Escurece levemente a tela, esconde distrações (notas e botões) e centraliza sua atenção apenas no que importa.

## O Futuro: A Central Administrativa

O ambiente relaxante é apenas a fundação. As próximas atualizações transformarão o **cafe.rc** em um dashboard real, mantendo a filosofia cozy:

- [ ] **Integração de Tarefas (To-Do):** Gerenciamento de tarefas em formato de terminal e Kanban suave.
- [ ] **Módulo Pomodoro:** Um timer integrado na mode-line do Vim, misturado com os sons do ambiente.
- [ ] **Widgets Administrativos:** Painéis para consumo de APIs externas (Status de servidores, Analytics, Clima) renderizados com a estética do terminal.
- [ ] **Comandos Reais no Terminal:** Fazer o log inferior aceitar inputs do usuário (`:clear`, `:focus`, `:new-note`, etc).

## Como usar

Como o projeto é construído 100% em **Vanilla HTML/CSS/JS** (com Tone.js importado via CDN), não há necessidade de build, Node.js ou bundlers.

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/vim-cafe-rc.git
   ```
2. Abra a pasta do projeto.
3. Dê um duplo clique no arquivo `index.html` para abrir no seu navegador.
4. Coloque os fones de ouvido, clique na tela para compilar os grãos, e relaxe.

---

<p align="center">
  <i>"Puxe uma cadeira, escute a chuva e digite com calma."</i><br>

</p>
