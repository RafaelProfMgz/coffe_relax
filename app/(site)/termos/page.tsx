import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: `Termos de uso do ${SITE.name}: o que o serviço faz, o que você pode fazer com ele e quais são os limites de responsabilidade.`,
  alternates: { canonical: absoluteUrl("/termos") },
  openGraph: {
    title: `Termos de Serviço — ${SITE.name}`,
    description: `Termos de uso do ${SITE.name}.`,
    url: absoluteUrl("/termos"),
  },
};

const updated = new Date(SITE.legalUpdatedAt).toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default function TermosPage() {
  return (
    <>
      <main className="legal">
      <Link href="/" className="legal-back">
        ← voltar para o café
      </Link>

      <h1>Termos de Serviço</h1>
      <p className="legal-meta">Última atualização: {updated}</p>

      <p className="legal-lead">
        Estes termos valem para o uso do <strong>{SITE.name}</strong> ({SITE.url}). Ao usar o site, você
        concorda com o que está escrito aqui. É um projeto pessoal e gratuito — leia com calma, é curto.
      </p>

      <h2>1. O que é o serviço</h2>
      <p>
        O {SITE.name} é um ambiente de foco que roda inteiramente no seu navegador. Ele oferece sons
        ambientes gerados ao vivo, um player para vídeos do YouTube que você mesmo escolhe, um timer
        pomodoro, um mural de notas e um card de clima.
      </p>
      <p>
        Não há cadastro, login, cobrança nem servidor guardando o seu conteúdo. Tudo que você cria —
        playlist, notas, preferências — fica salvo no armazenamento local do seu próprio navegador.
      </p>

      <h2>2. Quem pode usar</h2>
      <p>
        Qualquer pessoa. Se você tem menos de 16 anos, use com o acompanhamento de um responsável, já que
        o site permite abrir conteúdo externo do YouTube que não é moderado por nós.
      </p>

      <h2>3. Conteúdo de terceiros</h2>
      <p>
        Os vídeos e músicas tocados vêm do YouTube, por links que <em>você</em> cola. Nós não hospedamos,
        não distribuímos e não temos controle sobre esse conteúdo. Ao usar o player, você também está
        sujeito aos{" "}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
          Termos de Serviço do YouTube
        </a>
        .
      </p>
      <p>
        Você é responsável por usar apenas links que tenha o direito de acessar e reproduzir. Os acervos
        que indicamos (Freesound, Pixabay, Musopen e outros) têm licenças próprias — confira cada faixa
        antes de reutilizar em um trabalho seu, principalmente em contexto comercial.
      </p>

      <h2>4. Uso aceitável</h2>
      <p>Ao usar o {SITE.name}, você concorda em não:</p>
      <ul>
        <li>usar o serviço para atividades ilegais ou que violem direitos de terceiros;</li>
        <li>tentar derrubar, sobrecarregar ou explorar falhas do site ou dos serviços que ele consome;</li>
        <li>
          contornar as proteções técnicas de plataformas de terceiros (por exemplo, baixar conteúdo do
          YouTube fora do que a própria plataforma permite).
        </li>
      </ul>

      <h2>5. Seus dados são seus</h2>
      <p>
        Tudo que você salva fica no seu navegador. Isso tem um efeito prático importante:{" "}
        <strong>limpar os dados do site, usar uma janela anônima ou trocar de dispositivo apaga a sua
        playlist e as suas notas</strong>. Não temos como recuperar esse conteúdo, porque nunca chegamos a
        ter uma cópia dele.
      </p>
      <p>
        Os detalhes de o que é guardado e por quê estão na{" "}
        <Link href="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>6. Disponibilidade e mudanças</h2>
      <p>
        O serviço é oferecido &ldquo;como está&rdquo;, sem garantia de funcionamento ininterrupto. Podemos
        alterar, suspender ou encerrar qualquer parte do site a qualquer momento, inclusive recursos que
        você usa hoje.
      </p>

      <h2>7. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei aplicável, o {SITE.name} e seu autor não respondem por perda
        de dados, lucros cessantes ou danos indiretos decorrentes do uso ou da impossibilidade de uso do
        site. Isso não afasta direitos que a legislação consumerista brasileira garanta a você e que não
        possam ser limitados por contrato.
      </p>

      <h2>8. Propriedade intelectual</h2>
      <p>
        O código do projeto é aberto e está disponível em{" "}
        <a href={SITE.repo} target="_blank" rel="noopener noreferrer">
          {SITE.repo}
        </a>
        , sob a licença indicada no repositório. A marca, os textos e a identidade visual do {SITE.name}{" "}
        continuam sendo do autor.
      </p>

      <h2>9. Alterações nestes termos</h2>
      <p>
        Quando estes termos mudarem, a data de atualização no topo da página muda junto. Mudanças
        relevantes também fazem o aviso de privacidade aparecer de novo, para que você possa rever a sua
        escolha.
      </p>

      <h2>10. Lei aplicável e contato</h2>
      <p>
        Aplica-se a legislação brasileira, com foro na comarca de domicílio do usuário para questões de
        consumo. Dúvidas, pedidos ou reclamações:{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <p className="legal-note">
        Este documento é um texto-base honesto sobre como o projeto funciona, escrito para ser lido por
        pessoas — não substitui a revisão de um advogado antes de um uso comercial.
      </p>
      </main>
      <div className="legal" style={{ paddingTop: 0 }}>
        <SiteFooter />
      </div>
    </>
  );
}
