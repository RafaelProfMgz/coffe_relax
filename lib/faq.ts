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
        a: "Os sons ambientes, o teclado e os arquivos de áudio abertos do seu computador funcionam depois que a página carregou, porque rodam no seu navegador. YouTube, Spotify e links de áudio precisam de conexão.",
      },
    ],
  },
  {
    title: "Sons e players",
    items: [
      {
        q: "De onde vêm os sons de chuva, mar e lareira?",
        a: "Eles são sintetizados ao vivo pela Web Audio API, a partir de ruído filtrado e osciladores. Não há arquivo de áudio sendo baixado, então não há licença, anúncio nem atraso de rede.",
        link: { href: "/docs/mesa-de-ambiente", label: "Mesa de Ambiente" },
      },
      {
        q: "Posso misturar vários sons ao mesmo tempo?",
        a: "Pode. Os dez sons tocam juntos, cada um com seu volume, e ainda dá para tocar até quatro players por cima. As cinco misturas prontas são um bom ponto de partida.",
      },
      {
        q: "O que dá para tocar nos players?",
        a: "Vídeos e playlists do YouTube (links com list=), Spotify (faixa, álbum, playlist, artista, episódio, podcast e audiobook), links diretos de áudio (mp3, m4a, ogg, wav, opus, flac, aac) e arquivos de áudio do seu computador. O título é buscado automaticamente se você não digitar um.",
        link: { href: "/docs/playlist", label: "Players e canais" },
      },
      {
        q: "Dá para ouvir duas coisas ao mesmo tempo?",
        a: "Dá. São até quatro canais tocando juntos, cada um com seu volume e um rótulo, como Música, Audiobook ou Podcast. Por exemplo: um audiobook num canal e uma música baixinha em outro.",
      },
      {
        q: "O audiobook volta de onde eu parei?",
        a: 'Volta. Itens com 10 minutos ou mais (audiobooks, podcasts, mixes longos) guardam a posição no seu navegador, se você autorizou "Preferências". No YouTube e no áudio direto, dá também para mudar a velocidade de 0,75× a 2×.',
      },
      {
        q: "Por que o Spotify só toca 30 segundos?",
        a: "Sem estar logado no Spotify neste navegador, o player oficial deles toca só prévias de 30 segundos. O player do Spotify também não deixa o site mudar o volume nem pular faixas: isso é feito no próprio player embutido.",
      },
      {
        q: "Por que um vídeo do YouTube não toca?",
        a: "Alguns vídeos têm a reprodução em outros sites desativada pelo dono, ou estão bloqueados na sua região. Nesses casos o player do YouTube recusa a faixa; troque por outra versão do mesmo vídeo.",
      },
    ],
  },
  {
    title: "Seus dados",
    items: [
      {
        q: "Onde fica a minha biblioteca de links?",
        a: 'No armazenamento local (localStorage) do seu navegador, e só se você autorizar "Preferências" no aviso de privacidade. Nada disso vai para um servidor nosso.',
        link: { href: "/privacidade", label: "Política de Privacidade" },
      },
      {
        q: "Meus arquivos de áudio são enviados para algum lugar?",
        a: "Não. Um arquivo aberto do seu computador toca só nesta sessão, direto do seu disco. Ele não é enviado para lugar nenhum e não fica guardado; ao recarregar a página, é só abrir de novo.",
      },
      {
        q: "Perdi minha biblioteca. Dá para recuperar?",
        a: "Infelizmente não. Como os dados ficam só no seu navegador, limpar os dados do site, usar janela anônima ou trocar de aparelho apaga tudo, e nós nunca tivemos uma cópia.",
      },
      {
        q: "Como passo minha biblioteca para outro computador?",
        a: "Ainda não existe sincronização. Por enquanto, a forma de levar a biblioteca é adicionar os mesmos links no outro navegador. A sincronização opcional está no plano do projeto.",
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
