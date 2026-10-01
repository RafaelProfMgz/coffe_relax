import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import { SITE, absoluteUrl, legalUpdatedLabel } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: `Como o ${SITE.name} trata seus dados: armazenamento local, consentimento, geolocalização e serviços de terceiros. Sem contas e sem rastreamento.`,
  alternates: { canonical: absoluteUrl("/privacidade") },
  openGraph: {
    title: `Política de Privacidade — ${SITE.name}`,
    description: `Como o ${SITE.name} trata seus dados. Sem contas e sem rastreamento.`,
    url: absoluteUrl("/privacidade"),
  },
};

export default function PrivacidadePage() {
  return (
    <ContentPage
      title="Política de Privacidade"
      meta={`Última atualização: ${legalUpdatedLabel}`}
      lead={
        <>
          Resumo honesto: o <strong>{SITE.name}</strong> não tem contas, não tem banco de dados, não usa
          analytics e não vende nada para ninguém. O que você cria fica no seu navegador. Esta página explica
          as exceções — porque existem algumas, e você merece saber quais são.
        </>
      }
    >
      <h2>1. Quem é o controlador</h2>
      <p>
        O site é mantido por {SITE.author}, como projeto pessoal e de código aberto. Contato para assuntos de
        privacidade: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2>2. O que guardamos no seu navegador</h2>
      <p>
        Usamos o <code>localStorage</code> — não cookies de rastreamento. Nada disso é enviado para um
        servidor nosso, porque não existe servidor nosso guardando conteúdo de usuário.
      </p>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Para quê</th>
            <th>Base</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>coffe_consent_v1</code>
            </td>
            <td>Lembra a sua escolha de privacidade, para não perguntarmos a cada visita.</td>
            <td>Estritamente necessário</td>
          </tr>
          <tr>
            <td>
              <code>coffe_yt_library_v2</code>
            </td>
            <td>Sua playlist: link e título de cada faixa que você salvou.</td>
            <td>Consentimento</td>
          </tr>
          <tr>
            <td>
              <code>coffe_notes</code>
            </td>
            <td>Texto, cor e posição das notas do mural.</td>
            <td>Consentimento</td>
          </tr>
          <tr>
            <td>
              <code>coffe_volume</code>, <code>coffe_muted</code>, <code>coffe_focus</code>
            </td>
            <td>Volume, silêncio e modo noite.</td>
            <td>Consentimento</td>
          </tr>
        </tbody>
      </table>

      <p>
        Enquanto você não autorizar &ldquo;Preferências&rdquo;, <strong>nada é gravado</strong> — o site
        funciona normalmente, só esquece tudo ao recarregar. Se você aceitar e depois mudar de ideia, o botão{" "}
        <em>apagar meus dados</em> remove todas as chaves acima na hora.
      </p>

      <h2>3. Localização</h2>
      <p>
        O card de clima funciona sem a sua localização: por padrão ele mostra São Paulo. Se você quiser o
        clima do seu lugar, precisa autorizar duas vezes — uma aqui no site e outra no pedido do próprio
        navegador. Você pode recusar qualquer uma das duas.
      </p>
      <p>
        Quando autorizado, as coordenadas são usadas para <strong>uma única consulta</strong> ao serviço de
        previsão do tempo e descartadas em seguida. Não gravamos, não associamos a você e não compartilhamos
        com mais ninguém. O botão <em>revogar</em> no card desfaz a permissão a qualquer momento.
      </p>

      <h2>4. Serviços de terceiros</h2>
      <p>
        Algumas partes do site conversam com serviços externos. Quando isso acontece, esses serviços recebem o
        seu endereço IP e informações básicas do navegador, como qualquer site que você visita. O teste de
        serviços da página <Link href="/sistema">Sistema</Link> também fala com o YouTube e o Open-Meteo, mas
        só quando você aperta o botão.
      </p>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Serviço</th>
            <th>Quando é acionado</th>
            <th>O que recebe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                YouTube (modo sem cookies)
              </a>
            </td>
            <td>Ao tocar uma faixa da sua playlist.</td>
            <td>
              IP e dados do player. Usamos o domínio <code>youtube-nocookie.com</code>, que não grava cookies
              de rastreamento antes da reprodução.
            </td>
          </tr>
          <tr>
            <td>
              <a href="https://open-meteo.com/en/terms" target="_blank" rel="noopener noreferrer">
                Open-Meteo
              </a>
            </td>
            <td>Ao carregar o card de clima.</td>
            <td>IP e as coordenadas consultadas (São Paulo, ou a sua, se autorizada).</td>
          </tr>
          <tr>
            <td>YouTube (miniaturas e títulos)</td>
            <td>Ao exibir a capa e buscar o título de uma faixa salva.</td>
            <td>IP e o identificador público do vídeo.</td>
          </tr>
        </tbody>
      </table>

      <p>
        As fontes tipográficas são servidas pelo próprio site, então nenhuma requisição vai para servidores de
        fontes de terceiros. Os sons ambientes são sintetizados no seu navegador: não há download de áudio nem
        chamada de rede para tocá-los.
      </p>

      <h2>5. Formulário de contato</h2>
      <p>
        Quando você usa o <Link href="/contato">formulário de contato</Link>, enviamos o nome, o e-mail, o
        assunto e a mensagem que você escreveu para a nossa caixa de e-mail, para podermos responder. O envio
        passa pelo{" "}
        <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          Resend
        </a>
        , o serviço que entrega o e-mail. O site não grava a mensagem em banco de dados nenhum: ela existe só
        na caixa de entrada, e você pode pedir para apagarmos a conversa quando quiser.
      </p>
      <p>
        Base legal: o seu pedido (você nos procurou e quer uma resposta). Se preferir, escreva direto para{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> pelo seu próprio programa de e-mail.
      </p>

      <h2>6. Hospedagem</h2>
      <p>
        O site é hospedado na{" "}
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          Vercel
        </a>
        . Como em qualquer hospedagem, ela registra por pouco tempo dados técnicos de cada acesso (endereço
        IP, página pedida, navegador) para entregar as páginas e proteger o serviço contra abuso. Não usamos
        esses registros para medir audiência nem para identificar ninguém.
      </p>

      <h2>7. O que nós não fazemos</h2>
      <ul>
        <li>Não usamos Google Analytics nem qualquer outra ferramenta de medição de audiência.</li>
        <li>Não usamos pixels de rastreamento, fingerprinting ou cookies de publicidade.</li>
        <li>Não criamos perfis, não fazemos publicidade comportamental e não vendemos dados.</li>
        <li>Não temos acesso ao conteúdo das suas notas nem à sua playlist.</li>
      </ul>

      <h2>8. Seus direitos</h2>
      <p>
        Pela LGPD (Lei 13.709/2018) e pelo GDPR, você tem direito de acesso, correção, exclusão, portabilidade
        e revogação do consentimento. Como os dados ficam no seu dispositivo, você exerce a maior parte desses
        direitos diretamente:
      </p>
      <ul>
        <li>
          <strong>Acesso e portabilidade:</strong> as ferramentas de desenvolvedor do navegador mostram o
          conteúdo do <code>localStorage</code> deste site, em JSON legível.
        </li>
        <li>
          <strong>Exclusão e revogação:</strong> o botão <em>Preferências de privacidade</em>, no rodapé, abre
          o painel com a opção de apagar tudo.
        </li>
        <li>
          <strong>Qualquer outra solicitação:</strong> use o{" "}
          <Link href="/contato?tipo=privacidade">formulário de contato</Link> (assunto &ldquo;Privacidade e
          dados&rdquo;) ou escreva para <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </li>
      </ul>

      <h2>9. Crianças</h2>
      <p>
        O site não é direcionado a menores de 13 anos e não coleta dados de forma consciente desse público.
      </p>

      <h2>10. Segurança</h2>
      <p>
        O site é servido por HTTPS. Como não há armazenamento de dados pessoais em servidor nosso (o
        formulário de contato só repassa a mensagem por e-mail), a superfície de risco é pequena por
        construção — mas lembre-se de que qualquer pessoa com acesso físico ao seu navegador consegue ler o
        que está salvo nele.
      </p>

      <h2>11. Mudanças nesta política</h2>
      <p>
        Alterações aparecem aqui com nova data de atualização. Se a mudança afetar a forma como tratamos
        consentimento, o aviso reaparece para você decidir de novo.
      </p>

      <p className="legal-note">
        Veja também os <Link href="/termos">Termos de Serviço</Link>. Este texto descreve o funcionamento real
        do projeto em linguagem simples — para uso comercial, vale a revisão de um advogado.
      </p>
    </ContentPage>
  );
}
