---
name: ui-ux
description: Diretrizes de UI e UX do coffe to relax — paleta "Papel & Café Torrado", design tokens, tipografia, modo noite, acessibilidade, microinterações e sons de interface. Use ao criar ou alterar qualquer componente visual, página, layout, animação ou fluxo de interação do app.
---

# UI & UX — coffe to relax

O produto é um refúgio calmo: nada pode "gritar urgência". Toda decisão visual e de interação deve reforçar calma, calor e foco.

## Fonte da verdade

- Tokens em `app/globals.css` (`:root` e `[data-theme="dark"]`). **Nunca** use cor, sombra ou raio literal num componente — use `var(--token)`.
- A base visual do app (`app/(site)`) é CSS puro em `app/globals.css`. Tailwind (sem preflight) e shadcn/ui estão disponíveis via `app/tailwind.css` para componentes novos — veja a skill `shadcn`. Animações com `motion/react`.
- Fontes vêm de `lib/fonts.ts` (`--font-ui` Inter, `--font-display` Cormorant, `--font-mono` Fira).

## Paleta e tokens

| Papel | Token | Regra |
| :-- | :-- | :-- |
| Fundo | `--paper`, `--paper-deep` | Fundo de página e áreas rebaixadas |
| Superfície | `--surface`, `--surface-2` | Cartões, painéis, popovers |
| Bordas | `--line`, `--line-soft` | 1px; prefira bordas suaves a sombras fortes |
| Texto | `--ink`, `--ink-soft`, `--ink-faint` | Hierarquia por tom, não por tamanho exagerado |
| Destaque | `--accent`, `--accent-soft`, `--accent-ink` | **Único** destaque. Um elemento acentuado por região |
| Estado | `--green` (ok/licença aberta), `--red` (erro), `--blue` (info) | Só para semântica, nunca decoração |
| Profundidade | `--glow`, `--glow-lg` | Sombras quentes e difusas |
| Foco | `--ring` | Sempre visível em `:focus-visible` |
| Raios | `--r-sm` 8 · `--r-md` 14 · `--r-lg` 20 · `--r-xl` 26 | |
| Movimento | `--ease` | Curva padrão de todas as transições |

Ao criar um token novo, defina-o **nos dois temas**. O modo noite é quente (marrons), nunca azul frio.

## Tipografia

- UI: `--font-ui`, base 15px, `line-height` 1.55.
- Títulos editoriais / momentos de respiro: `--font-display`.
- Dados, logs, atalhos de teclado, contadores: `--font-mono` (combina com a herança vim do projeto).
- Use `font-variant-numeric: tabular-nums` em timers e números que mudam.

## Movimento e som

- Transições de 150–300ms com `var(--ease)`; nada de bounce agressivo.
- Respeite `@media (prefers-reduced-motion: reduce)`: desligue animações não essenciais.
- Sons de interface passam por `hooks/useSound.tsx` / `components/ui/SoundButton.tsx`. Som é recompensa, não alerta: volume baixo, nunca tocar sem gesto do usuário (política de autoplay + `StartOverlay`).
- Atalhos de teclado (h j k l w b espaço) não podem disparar dentro de `input`, `textarea` ou `contenteditable`.

## Acessibilidade (obrigatório)

- Contraste AA: texto `--ink`/`--ink-soft` sobre `--paper`/`--surface`. `--ink-faint` só para texto não essencial.
- Todo controle interativo é `<button>`/`<a>`/`<input>` real, com nome acessível (`aria-label` quando só tem ícone).
- Sliders da mesa de ambiente: `aria-valuetext` legível ("Chuva, 40%").
- Alvos de toque ≥ 40×40px; layout funciona em 360px de largura sem scroll horizontal.
- Ordem de foco segue a ordem visual; modais/overlays prendem e devolvem o foco.

## Privacidade como UX

Nada é salvo no navegador antes do consentimento (`hooks/useConsent.tsx`, `lib/storage.ts`). Qualquer feature nova que persista dados precisa passar por essa camada e respeitar a categoria certa (necessário / preferências).

## Checklist antes de entregar

1. Só tokens, funcionando em claro **e** noite.
2. Estados: hover, `:focus-visible`, ativo, desabilitado, carregando, vazio, erro.
3. Testado em mobile (360px) e com teclado apenas.
4. `prefers-reduced-motion` respeitado.
5. Textos em pt-BR, tom acolhedor e curto ("Nada por aqui ainda — que tal um café?" em vez de "Nenhum dado encontrado").
