/** Estado de carregamento das rotas — xícara enchendo enquanto o café passa. */
export default function Loading() {
  return (
    <div className="loading-page" role="status" aria-live="polite">
      <span className="loading-cup" aria-hidden>
        ☕
      </span>
      <p className="loading-text">passando o café...</p>
      <div className="loading-bar" aria-hidden>
        <span />
      </div>
      <span className="sr-only">Carregando</span>
    </div>
  );
}
