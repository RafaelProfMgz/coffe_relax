import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import { ALL_FAQS, FAQ_GROUPS } from "@/lib/faq";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description: `Dúvidas comuns sobre o ${SITE.name}: som que não toca, playlist do YouTube, onde ficam suas notas, localização e privacidade.`,
  alternates: { canonical: absoluteUrl("/faq") },
  openGraph: {
    title: `Perguntas frequentes — ${SITE.name}`,
    description: `Dúvidas comuns sobre o ${SITE.name}.`,
    url: absoluteUrl("/faq"),
  },
};

/** FAQPage: o Google pode mostrar as perguntas direto no resultado da busca. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <ContentPage
      title="Perguntas frequentes"
      lead={
        <>
          As dúvidas que mais aparecem, em poucas linhas. Para o passo a passo de cada recurso, veja{" "}
          <Link href="/docs">Como usar</Link>.
        </>
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {FAQ_GROUPS.map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          {group.items.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
              {item.link && (
                <p>
                  <Link href={item.link.href}>{item.link.label} →</Link>
                </p>
              )}
            </details>
          ))}
        </section>
      ))}

      <p className="legal-note">
        Não achou a sua pergunta? <Link href="/contato?tipo=duvida">Pergunte pelo formulário de contato</Link>
        .
      </p>
    </ContentPage>
  );
}
