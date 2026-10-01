/**
 * Perguntas frequentes. As respostas são texto puro porque o mesmo conteúdo vira o
 * JSON-LD FAQPage (que o Google lê) e a página /faq. `link` aponta para onde saber mais.
 */
export type Faq = { q: string; a: string; link?: { href: string; label: string } };

export const FAQ_GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: "Começando",
    items: [
      {
        q: "Preciso criar conta ou pagar alguma coisa?",
        a: "Não. O coffe to relax é gratuito e não tem cadastro nem login. É só abrir o site e clicar na tela para começar.",
      },
      {
        q: "Por que preciso clicar na tela antes de ouvir alguma coisa?",
        a: "Os navegadores só deixam um site tocar som depois de uma interação sua. O clique na tela de abertura acorda o motor de áudio; a partir daí todos os sons funcionam.",
      },
      {
        q: "Funciona no celular?",
        a: "Sim. O layout desce para uma coluna em telas pequenas. No iPhone, confira se a chave de silencioso está desligada, porque ela também cala o som de sites.",
        link: { href: "/sistema", label: "Requisitos do sistema" },
      },
      {
        q: "Funciona sem internet?",
        a: "Os sons ambientes, o pomodoro, as notas e o teclado funcionam depois que a página carregou, porque rodam no seu navegador. A playlist do YouTube e o clima precisam de conexão.",
      },
    ],
  },
  {
    title: "Sons e playlist",
    items: [
      {
        q: "De onde vêm os sons de chuva, mar e lareira?",
        a: "Eles são sintetizados ao vivo pela Web Audio API, a partir de ruído filtrado e osciladores. Não há arquivo de áudio sendo baixado, então não há licença, anúncio nem atraso de rede.",
        link: { href: "/docs/mesa-de-ambiente", label: "Mesa de Ambiente" },
      },
      {
        q: "Posso misturar vários sons ao mesmo tempo?",
        a: "Pode. Os dez sons tocam juntos, cada um com seu volume, e ainda dá para tocar a playlist do YouTube por cima. As cinco misturas prontas são um bom ponto de partida.",
      },
      {
        q: "Que links do YouTube funcionam na playlist?",
        a: "Links de vídeo (youtube.com/watch?v=…), links curtos (youtu.be/…), Shorts, lives, links de incorporação (/embed/) e até o código do vídeo sozinho. O título é buscado automaticamente se você não digitar um.",
        link: { href: "/docs/playlist", label: "Playlist do YouTube" },
      },
      {
        q: "Por que um vídeo da playlist não toca?",
        a: "Alguns vídeos têm a reprodução em outros sites desativada pelo dono, ou estão bloqueados na sua região. Nesses casos o player do YouTube recusa a faixa; troque por outra versão do mesmo vídeo.",
      },
    ],
  },
  {
    title: "Seus dados",
    items: [
      {
        q: "Onde ficam minha playlist e minhas notas?",
        a: 'No armazenamento local (localStorage) do seu navegador, e só se você autorizar "Preferências" no aviso de privacidade. Nada disso vai para um servidor nosso.',
        link: { href: "/privacidade", label: "Política de Privacidade" },
      },
      {
        q: "Perdi minhas notas. Dá para recuperar?",
        a: "Infelizmente não. Como os dados ficam só no seu navegador, limpar os dados do site, usar janela anônima ou trocar de aparelho apaga tudo, e nós nunca tivemos uma cópia.",
      },
      {
        q: "Como passo minha playlist para outro computador?",
        a: "Ainda não existe sincronização. Por enquanto, a forma de levar a playlist é adicionar os mesmos links no outro navegador. A sincronização opcional está no plano do projeto.",
      },
      {
        q: "O site usa minha localização?",
        a: "Só se você pedir. O clima mostra São Paulo por padrão; para ver o do seu lugar você autoriza aqui no site e no pedido do navegador. As coordenadas servem para uma única consulta e não são guardadas.",
      },
      {
        q: "Como apago tudo o que o site guardou?",
        a: 'Clique em "Preferências de privacidade" no rodapé e escolha apagar os dados. Todas as chaves do site saem do seu navegador na hora.',
      },
    ],
  },
  {
    title: "Problemas e contato",
    items: [
      {
        q: "Não sai som nenhum. O que eu faço?",
        a: "Confira se você clicou na tela de abertura, se o volume geral no topo não está zerado ou mudo, e se a aba do navegador não está silenciada. A página Sistema testa o seu navegador e mostra o que pode estar faltando.",
        link: { href: "/sistema", label: "Testar meu navegador" },
      },
      {
        q: "Encontrei um erro ou tenho uma ideia. Como falo com vocês?",
        a: 'Pelo formulário de contato. Escolha "Encontrei um problema" ou "Sugestão" e conte o que aconteceu; respondemos pelo e-mail que você informar.',
        link: { href: "/contato", label: "Formulário de contato" },
      },
    ],
  },
];

export const ALL_FAQS = FAQ_GROUPS.flatMap((g) => g.items);
