import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: `O que é o ${SITE.name}, por que ele existe e para onde ele vai: uma cafeteria digital para focar com calma, sem conta e sem rastreamento.`,
  alternates: { canonical: absoluteUrl("/sobre") },
  openGraph: {
    title: `Sobre — ${SITE.name}`,
    description: `O que é o ${SITE.name} e por que ele existe.`,
    url: absoluteUrl("/sobre"),
  },
};

export default function SobrePage() {
  return (
    <ContentPage
      title="Sobre o coffe to relax"
      lead={
        <>
          O <strong>{SITE.name}</strong> é um espaço digital que não grita urgência: som de chuva, teclas
          mecânicas afinadas e cheiro (imaginário) de café recém-passado, para trabalhar ou estudar com calma.
        </>
      }
    >
      <h2>Por que existe</h2>
      <p>
        Passamos o dia em painéis frios e cheios de notificações. O projeto nasceu como uma brincadeira de
        terminal — um <code>~/.vim/cafe.rc</code> — e virou o oposto disso: um lugar quente, com uma paleta de
        papel envelhecido e café torrado, onde a única coisa piscando é o cursor.
      </p>

      <h2>O que dá para fazer</h2>
      <ul>
        <li>
          <strong>Mesa de Ambiente:</strong> dez sons gerados ao vivo no navegador (chuva, trovão, mar,
          floresta, lareira, cafeteria, vento, noite, tigela tibetana e vinil lo-fi), cada um com volume
          próprio, e cinco misturas prontas.
        </li>
        <li>
          <strong>Playlist do YouTube:</strong> cole links, o título vem sozinho e tudo fica salvo no seu
          navegador.
        </li>
        <li>
          <strong>Pomodoro:</strong> blocos de 25 minutos de foco e 5 de pausa, com uma tigela tibetana na
          virada.
        </li>
        <li>
          <strong>Mural de notas</strong>, <strong>clima</strong>, <strong>modo noite</strong> e um teclado de
          notas no estilo vim (<code>h j k l w b</code>).
        </li>
      </ul>
      <p>
        O passo a passo de cada recurso está em <Link href="/docs">Como usar</Link>.
      </p>

      <h2>Princípios</h2>
      <ul>
        <li>
          <strong>Sem conta e sem rastreamento.</strong> Não há login, analytics, pixels nem anúncios.
        </li>
        <li>
          <strong>Seus dados ficam com você.</strong> Playlist, notas e preferências ficam no seu navegador, e
          só depois que você autoriza. Detalhes na <Link href="/privacidade">Política de Privacidade</Link>.
        </li>
        <li>
          <strong>Som sem download.</strong> Os sons ambientes são sintetizados pela Web Audio API: nenhum
          arquivo de áudio, nenhuma licença, nenhum atraso de rede.
        </li>
        <li>
          <strong>Código aberto.</strong> Tudo está em{" "}
          <a href={SITE.repo} target="_blank" rel="noopener noreferrer">
            github.com/RafaelProfMgz/coffe_relax
          </a>
          .
        </li>
      </ul>

      <h2>Para onde vai</h2>
      <p>
        A ideia de longo prazo é transformar o ambiente numa central pessoal calma: agenda, caixa de entrada e
        tarefas com a mesma estética de cafeteria. Até lá, o foco é deixar o que já existe redondo. Tem uma
        ideia? <Link href="/contato?tipo=sugestao">Mande uma sugestão</Link>.
      </p>

      <h2>Quem faz</h2>
      <p>
        O {SITE.name} é um projeto pessoal de{" "}
        <a href={`https://github.com/${SITE.author}`} target="_blank" rel="noopener noreferrer">
          {SITE.author}
        </a>{" "}
        e faz parte do <a href={SITE.hub}>lotmhub</a>, junto com outros projetos como o{" "}
        <a href="https://alpendre.lotmhub.com.br">Alpendre</a>.
      </p>
    </ContentPage>
  );
}
