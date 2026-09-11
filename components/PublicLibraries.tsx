"use client";

import { useSound } from "@/hooks/useSound";

interface LibraryEntry {
  name: string;
  url: string;
  icon: string;
  /** Rótulo curto de licença, para o usuário saber o que pode usar. */
  license: string;
  desc: string;
  /** Atalho direto para uma busca relaxante dentro do acervo. */
  shortcut?: { label: string; url: string };
  featured?: boolean;
}

const LIBRARIES: LibraryEntry[] = [
  {
    name: "Freesound",
    url: "https://freesound.org/",
    icon: "🎙",
    license: "CC0 e CC-BY — confira faixa a faixa",
    desc:
      "A maior biblioteca colaborativa do mundo. Muitas faixas estão sob a licença CC0 (domínio público), mas fique atento: algumas exigem atribuição ao autor.",
    shortcut: { label: "buscar chuva em CC0", url: "https://freesound.org/search/?q=rain&f=license%3A%22Creative+Commons+0%22" },
    featured: true,
  },
  {
    name: "Pixabay Sound Effects",
    url: "https://pixabay.com/sound-effects/",
    icon: "✨",
    license: "Uso comercial livre, sem créditos",
    desc:
      "Excelente acervo de efeitos sonoros modernos e limpos, totalmente gratuitos para uso comercial e sem necessidade de créditos.",
    shortcut: { label: "buscar ambientes relaxantes", url: "https://pixabay.com/sound-effects/search/relaxing/" },
    featured: true,
  },
  {
    name: "Musopen",
    url: "https://musopen.org/",
    icon: "🎻",
    license: "Domínio público",
    desc:
      "Focado em música clássica de domínio público — peças de Bach, Beethoven e Mozart. Dá para baixar gravações de orquestras gratuitamente.",
    shortcut: { label: "gravações em domínio público", url: "https://musopen.org/music/" },
    featured: true,
  },
  {
    name: "Internet Archive — Audio",
    url: "https://archive.org/details/audio",
    icon: "📼",
    license: "Domínio público e CC (varia)",
    desc: "Acervo histórico gigantesco: field recordings, lo-fi, ASMR e gravações antigas.",
  },
  {
    name: "Openverse",
    url: "https://openverse.org/search/audio",
    icon: "🔎",
    license: "Só conteúdo aberto",
    desc: "Buscador da Creative Commons que varre vários acervos abertos de uma vez.",
  },
];

/**
 * Bibliotecas públicas para o usuário ir além dos sons sintetizados:
 * ele baixa a faixa lá, sobe no YouTube ou usa o link direto na playlist.
 */
export default function PublicLibraries() {
  const sound = useSound();

  return (
    <section className="panel" aria-label="Bibliotecas públicas de sons relaxantes">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Bibliotecas Públicas</h2>
          <p className="panel-sub">Acervos abertos para garimpar sons relaxantes sem dor de cabeça com licença.</p>
        </div>
      </header>

      <ul className="lib-list">
        {LIBRARIES.map((lib) => (
          <li key={lib.name} className={`lib ${lib.featured ? "is-featured" : ""}`}>
            <span className="lib-icon" aria-hidden>
              {lib.icon}
            </span>
            <div className="lib-body">
              <a
                className="lib-name"
                href={lib.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={sound.hover}
                onClick={sound.click}
              >
                {lib.name} ↗
              </a>
              <span className="lib-license">{lib.license}</span>
              <p className="lib-desc">{lib.desc}</p>
              {lib.shortcut && (
                <a
                  className="lib-shortcut"
                  href={lib.shortcut.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={sound.hover}
                  onClick={sound.click}
                >
                  → {lib.shortcut.label}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="lib-foot">
        Baixou algo que gostou? Suba no YouTube ou ache a faixa lá e salve o link na sua playlist acima —
        o link e o título ficam guardados no seu navegador.
      </p>
    </section>
  );
}
