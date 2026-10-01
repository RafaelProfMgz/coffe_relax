"use client";

import { useEffect } from "react";
import Link from "next/link";
import MessagePage from "@/components/MessagePage";

/**
 * Captura erros de renderização das rotas. O `reset()` tenta montar
 * o segmento de novo sem recarregar a página inteira.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sem serviço de telemetria: o erro fica no console do navegador
    console.error("[coffe to relax] erro na rota:", error);
  }, [error]);

  return (
    <MessagePage
      code="500"
      emoji="🫖"
      title="O café entornou"
      terminal="tail -f /var/log/cafe.log # algo quebrou por aqui"
    >
      <p>
        Alguma coisa deu errado ao preparar esta página. Nada do que você salvou foi perdido — sua
        playlist e suas notas continuam no seu navegador.
      </p>
      {error.digest && (
        <p className="msg-digest">
          código do erro: <code>{error.digest}</code>
        </p>
      )}
      <div className="msg-actions">
        <button className="btn btn-solid" onClick={reset}>
          tentar de novo
        </button>
        <Link href="/" className="btn">
          voltar para o início
        </Link>
      </div>
    </MessagePage>
  );
}
