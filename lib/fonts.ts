import { Fira_Code, Cormorant_Garamond, Inter } from "next/font/google";

/* Fontes servidas pelo próprio domínio: sem requisição a servidores de terceiros.
   Ficam aqui porque o app, a documentação e a 404 global têm layouts raiz separados. */
const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fira",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

/** Classes das variáveis de fonte, para o <html> de cada layout raiz. */
export const fontVariables = `${firaCode.variable} ${cormorant.variable} ${inter.variable}`;
