import type { Metadata } from "next";
import Link from "next/link";
import MessagePage from "@/components/MessagePage";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "Esta página não existe no coffe to relax.",
  // Uma 404 não deve entrar no índice de busca
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <MessagePage
        code="404"
        emoji="☕"
        title="Essa xícara está vazia"
        terminal="cd /refugio && ls -la # nada por aqui"
      >
        <p>
          A página que você procurou não existe — ou foi tomada por alguém antes de você. Acontece nos
          melhores cafés.
        </p>
        <div className="msg-actions">
          <Link href="/" className="btn btn-solid">
            voltar para o café
          </Link>
          <Link href="/privacidade" className="btn">
            política de privacidade
          </Link>
          <Link href="/termos" className="btn">
            termos de serviço
          </Link>
        </div>
      </MessagePage>
      <div className="legal" style={{ paddingTop: 0 }}>
        <SiteFooter />
      </div>
    </>
  );
}
