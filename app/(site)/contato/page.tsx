import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import ContactForm from "./contact-form";
import { emailConfigured } from "@/lib/email";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com o ${SITE.name}: dúvidas, problemas, sugestões e pedidos sobre privacidade.`,
  alternates: { canonical: absoluteUrl("/contato") },
  openGraph: {
    title: `Contato — ${SITE.name}`,
    description: `Fale com o ${SITE.name}.`,
    url: absoluteUrl("/contato"),
  },
};

export default async function ContatoPage({ searchParams }: PageProps<"/contato">) {
  const { tipo } = await searchParams;

  return (
    <ContentPage
      title="Contato"
      lead={
        <>
          Dúvida, problema, sugestão ou pedido sobre os seus dados: escreva aqui. Antes, vale uma olhada nas{" "}
          <Link href="/faq">perguntas frequentes</Link> — a resposta pode já estar lá.
        </>
      }
    >
      <ContactForm initialType={typeof tipo === "string" ? tipo : undefined} enabled={emailConfigured()} />

      <h2>Outras formas</h2>
      <ul>
        <li>
          E-mail direto: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
        </li>
        <li>
          Problemas técnicos e ideias também podem virar uma{" "}
          <a href={`${SITE.repo}/issues`} target="_blank" rel="noopener noreferrer">
            issue no GitHub
          </a>
          .
        </li>
      </ul>

      <p className="legal-note">
        O que você envia aqui vai por e-mail para a nossa caixa de entrada e não fica guardado no site. Detalhes
        na <Link href="/privacidade">Política de Privacidade</Link>.
      </p>
    </ContentPage>
  );
}
