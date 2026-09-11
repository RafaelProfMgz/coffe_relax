"use client";

/**
 * Último recurso: pega erros do próprio root layout, então precisa
 * renderizar <html> e <body> por conta própria.
 *
 * Por isso tudo aqui é estilo inline — se o layout falhou, não dá para
 * contar com as variáveis de tema nem com as fontes que ele carrega.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#f7f0e2",
          color: "#362f28",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          lineHeight: 1.55,
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
            background: "#fffaf0",
            border: "1px solid #e0d2b8",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 24px 60px -28px rgba(54,47,40,.38)",
          }}
        >
          <div style={{ fontSize: "3rem", lineHeight: 1 }}>🫖</div>
          <p
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: ".72rem",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "#c65a1e",
              margin: "14px 0 6px",
            }}
          >
            erro crítico
          </p>
          <h1 style={{ fontSize: "1.7rem", margin: "0 0 10px", fontWeight: 600 }}>
            A cafeteria fechou por um instante
          </h1>
          <p style={{ fontSize: ".92rem", color: "#6d6051", margin: "0 0 8px" }}>
            Algo falhou antes mesmo de a página montar. Recarregar costuma resolver — e nada do que
            você salvou no navegador foi perdido.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: ".74rem",
                color: "#9b8d7a",
                margin: "0 0 20px",
              }}
            >
              código: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                font: "inherit",
                fontWeight: 600,
                fontSize: ".85rem",
                padding: ".6rem 1.1rem",
                borderRadius: 8,
                border: "1px solid #c65a1e",
                background: "#c65a1e",
                color: "#fff6ed",
                cursor: "pointer",
              }}
            >
              tentar de novo
            </button>
            <a
              href="/"
              style={{
                font: "inherit",
                fontSize: ".85rem",
                padding: ".6rem 1.1rem",
                borderRadius: 8,
                border: "1px solid #e0d2b8",
                background: "#fffaf0",
                color: "#362f28",
                textDecoration: "none",
              }}
            >
              voltar para o início
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
