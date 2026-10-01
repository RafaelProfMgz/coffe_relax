import type { Metadata } from "next";
import Link from "next/link";
import MessagePage from "@/components/MessagePage";
import SiteFooter from "@/components/SiteFooter";
import Providers from "./(site)/providers";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import "./globals.css";

/*
  404 de qualquer endereço que não existe. O app e a documentação têm layouts raiz separados,
  então esta página monta o próprio <html> (o Next injeta o noindex sozinho).
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `Página não encontrada — ${SITE.name}`,
  description: `Esta página não existe no ${SITE.name}.`,
};

export default function GlobalNotFound() {
  return (
    <html lang="pt-BR" data-theme="light" className={fontVariables}>
      <body>
        <Providers>
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
              <Link href="/docs" className="btn">
                como usar
              </Link>
              <Link href="/faq" className="btn">
                perguntas frequentes
              </Link>
            </div>
          </MessagePage>
          <div className="legal" style={{ paddingTop: 0 }}>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
