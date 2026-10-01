import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import { BrowserCheck, ServiceStatus } from "./system-check";
import { SITE, absoluteUrl } from "@/lib/site";
import { APP_VERSION, COMMIT_SHA, DEPLOY_ENV } from "@/lib/version";

export const metadata: Metadata = {
  title: "Sistema",
  description: `Status e requisitos do ${SITE.name}: navegadores compatíveis, teste do seu navegador, serviços externos e como o app funciona por dentro.`,
  alternates: { canonical: absoluteUrl("/sistema") },
  openGraph: {
    title: `Sistema — ${SITE.name}`,
    description: `Status e requisitos do ${SITE.name}.`,
    url: absoluteUrl("/sistema"),
  },
};

export default function SistemaPage() {
  return (
    <ContentPage
      title="Status e requisitos"
      meta={
        <>
          versão {APP_VERSION}
          {COMMIT_SHA && (
            <>
              {" "}
              ·{" "}
              <a href={`${SITE.repo}/commit/${COMMIT_SHA}`} target="_blank" rel="noopener noreferrer">
                {COMMIT_SHA}
              </a>
            </>
          )}{" "}
          · {DEPLOY_ENV}
        </>
      }
      lead="Tudo o que o coffe to relax precisa para funcionar, e um teste rápido para descobrir por que algo não está tocando."
    >
      <h2>Seu navegador</h2>
      <p>Este teste roda só aqui no seu aparelho, sem enviar nada a ninguém.</p>
      <BrowserCheck />

      <h2>Serviços</h2>
      <p>
        O site e os dois serviços externos que o app usa. O teste só roda quando você aperta o botão, porque ele
        conversa com o YouTube e o Open-Meteo do mesmo jeito que o app faria.
      </p>
      <ServiceStatus />

      <h2>Navegadores compatíveis</h2>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Navegador</th>
            <th>Versão mínima</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chrome, Edge, Brave, Opera</td>
            <td>111</td>
            <td>Experiência completa.</td>
          </tr>
          <tr>
            <td>Firefox</td>
            <td>113</td>
            <td>Experiência completa.</td>
          </tr>
          <tr>
            <td>Safari (macOS e iOS)</td>
            <td>16.4</td>
            <td>No iPhone, a chave de silencioso também cala o som de sites.</td>
          </tr>
          <tr>
            <td>Navegadores de apps (Instagram, WhatsApp)</td>
            <td>—</td>
            <td>Podem bloquear o áudio; abra no navegador do aparelho.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Fones de ouvido deixam a mistura de sons bem melhor, principalmente chuva, mar e a tigela tibetana. Os
        sons usam pouca CPU, mas ligar as dez camadas ao mesmo tempo num celular antigo pode esquentar o aparelho.
      </p>

      <h2>Como funciona por dentro</h2>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Parte</th>
            <th>Onde roda</th>
            <th>Precisa de internet?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mesa de Ambiente e sons de interface</td>
            <td>Seu navegador (Web Audio API)</td>
            <td>Não, depois que a página carregou</td>
          </tr>
          <tr>
            <td>Pomodoro, notas, teclado, modo noite</td>
            <td>Seu navegador</td>
            <td>Não</td>
          </tr>
          <tr>
            <td>Playlist</td>
            <td>Player oficial do YouTube (youtube-nocookie.com)</td>
            <td>Sim</td>
          </tr>
          <tr>
            <td>Clima</td>
            <td>Open-Meteo</td>
            <td>Sim</td>
          </tr>
          <tr>
            <td>Formulário de contato</td>
            <td>Servidor do site, que repassa por e-mail (Resend)</td>
            <td>Sim</td>
          </tr>
        </tbody>
      </table>
      <p>
        O site é feito em Next.js e hospedado na Vercel, no endereço <code>{SITE.url.replace(/^https?:\/\//, "")}</code>.
        Não há banco de dados: o que você salva fica no seu navegador. O código está no{" "}
        <a href={SITE.repo} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>

      <p className="legal-note">
        Algo falhou no teste e você não sabe o que fazer? Veja a{" "}
        <Link href="/docs/solucao-de-problemas">solução de problemas</Link> ou{" "}
        <Link href="/contato?tipo=problema">conte para a gente</Link>.
      </p>
    </ContentPage>
  );
}
