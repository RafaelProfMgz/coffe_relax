---
name: shadcn
description: shadcn/ui (Radix), Tailwind v4 sem preflight e Motion no coffe to relax — como estão configurados, tokens Papel & Café mapeados para o tema do shadcn, como adicionar componentes sem quebrar a documentação e como animar. Use ao adicionar componentes shadcn, usar classes Tailwind no app, criar primitivas acessíveis (dialog, popover, slider, tooltip) ou animar com motion.
---

# shadcn/ui — coffe to relax

## Como está configurado

- shadcn com base **Radix** (`radix-ui`), estilo `radix-nova`, ícones `lucide-react`. Config em `components.json`.
- O Tailwind do app fica em `app/tailwind.css`, importado em `app/(site)/layout.tsx` **antes** do `globals.css`.
  - Entra **sem o preflight** (reset): só `theme` e `utilities`. O `globals.css` fica fora de camada e por isso sempre vence as utilidades em caso de conflito — o visual antigo não muda.
  - As cores do shadcn (`--color-primary`, `--color-border`, …) apontam para os tokens Papel & Café, nos dois temas.
  - `dark:` usa `[data-theme="dark"]` (definido no `<html>` pelo `Workspace`).
  - Extras: `bg-paper`, `text-ink-soft`, `border-line`, `shadow-glow`, `rounded-md` (= `--r-md`), `ease-cafe`.
- A documentação (`app/docs.css`) tem o próprio Tailwind + Fumadocs. **Não** deixe o CLI do shadcn editar esse arquivo.
- `cn()` vem do pacote oficial `cn` (re-exportado em `lib/utils.ts`).
- `TooltipProvider` já envolve o site em `app/(site)/providers.tsx`.
- Já instalados: `button`, `dialog`, `slider`, `tooltip`.

## Adicionar componentes

```bash
npx shadcn@latest add popover tabs switch
```

Revise o diff: confirme que só `components/ui/*` mudou e que `app/docs.css` não foi tocado.
Como não há preflight, se um componente depender do reset (ex.: `<button>` com fundo cinza do navegador), resolva com uma classe no próprio componente (`bg-transparent`), nunca religando o preflight global.

## Animação: Motion

Use `motion` (sucessor do Framer Motion): `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`.
- Só em Client Components.
- Durações de 0.15–0.3s, `ease: [0.22, 0.8, 0.3, 1]` (igual ao `--ease`).
- Sempre cheque `useReducedMotion()` e desligue deslocamentos quando for `true`.

## Adaptando à estética

- Sombras: use `shadow-glow` / `shadow-glow-lg` no lugar de `shadow-*`.
- Foco: anel quente (`--ring`), nunca azul.
- Botões interativos do app devem tocar som: envolva ou componha com `SoundButton` / `useSound`.
- Animações respeitam `prefers-reduced-motion` e usam `--ease`.
- Textos e `aria-label` em pt-BR.
- Siga a skill `ui-ux` para o checklist final.

Para referência completa de CLI, registries e composição, carregue também `vercel:shadcn`.
