"use client";

import { forwardRef } from "react";
import { useSound } from "@/hooks/useSound";

type Variant = "ghost" | "solid" | "outline" | "pill" | "icon" | "danger";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Qual som tocar ao clicar. */
  sfx?: "click" | "confirm" | "reject" | "none";
  active?: boolean;
}

/**
 * Botão padrão do app: já vem com o clique quentinho e o sussurro de hover.
 */
const SoundButton = forwardRef<HTMLButtonElement, Props>(function SoundButton(
  { variant = "ghost", sfx = "click", active = false, onClick, onMouseEnter, className = "", children, ...rest },
  ref
) {
  const sound = useSound();

  return (
    <button
      ref={ref}
      className={`btn btn-${variant} ${active ? "is-active" : ""} ${className}`.trim()}
      onMouseEnter={(e) => {
        sound.hover();
        onMouseEnter?.(e);
      }}
      onClick={(e) => {
        if (sfx === "click") sound.click();
        else if (sfx === "confirm") sound.confirm();
        else if (sfx === "reject") sound.reject();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export default SoundButton;
