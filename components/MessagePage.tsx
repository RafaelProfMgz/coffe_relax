/**
 * Moldura compartilhada das páginas de estado (404, erro, etc).
 * É só apresentação — sem hooks — então serve tanto para Server
 * quanto para Client Components.
 */
export default function MessagePage({
  code,
  emoji,
  title,
  children,
  terminal,
}: {
  code: string;
  emoji: string;
  title: string;
  /** Linha de "comando" que aparece no rodapé do cartão. */
  terminal: string;
  children: React.ReactNode;
}) {
  return (
    <main className="msg-page">
      <div className="msg-card">
        <span className="msg-emoji" aria-hidden>
          {emoji}
        </span>
        <p className="msg-code">{code}</p>
        <h1 className="msg-title">{title}</h1>
        <div className="msg-body">{children}</div>
        <div className="msg-terminal">
          <span className="prompt">~</span>
          <span className="text">{terminal}</span>
          <span className="cursor-blink" aria-hidden />
        </div>
      </div>
    </main>
  );
}
