import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

/**
 * Moldura das páginas de texto (sobre, FAQ, contato, sistema, termos, privacidade):
 * coluna de leitura, link de volta e o rodapé do site.
 */
export default function ContentPage({
  title,
  meta,
  lead,
  children,
}: {
  title: string;
  /** Linha pequena abaixo do título (ex.: data de atualização). */
  meta?: React.ReactNode;
  /** Parágrafo de abertura, em destaque. */
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="legal">
        <Link href="/" className="legal-back">
          ← voltar para o café
        </Link>

        <h1>{title}</h1>
        {meta && <p className="legal-meta">{meta}</p>}
        {lead && <p className="legal-lead">{lead}</p>}

        {children}
      </main>
      <div className="legal" style={{ paddingTop: 0 }}>
        <SiteFooter />
      </div>
    </>
  );
}
