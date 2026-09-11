"use client";

import { useState } from "react";

export default function StartOverlay({ onStart }: { onStart: () => void }) {
  const [visible, setVisible] = useState(true);

  const start = () => {
    setVisible(false);
    onStart();
  };

  return (
    <div
      className={`start-overlay ${visible ? "" : "is-hidden"}`}
      onClick={start}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") start();
      }}
      role="button"
      tabIndex={0}
      aria-label="Iniciar o coffe to relax"
      aria-hidden={!visible}
    >
      <div className="cup" aria-hidden>
        <span className="steam" />
        <span className="steam" />
        <span className="steam" />
        ☕
      </div>
      <p className="start-cmd">
        $ ./serve_cafe.sh <span className="cursor-blink" />
      </p>
      <p className="start-title">uma cafeteria digital</p>
      <p className="start-hint">Coloque os fones e clique para moer os grãos</p>
    </div>
  );
}
