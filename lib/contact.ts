/**
 * Assuntos do formulário de contato. A mesma lista monta o formulário (navegador)
 * e valida o envio (servidor), e o assunto vira o prefixo do e-mail para facilitar filtros.
 */
export const CONTACT_TYPES = [
  { id: "duvida", label: "Dúvida sobre o uso", about: "Algo não ficou claro na documentação ou no FAQ." },
  {
    id: "problema",
    label: "Encontrei um problema",
    about: "Som que não toca, botão que não responde, layout quebrado.",
  },
  { id: "sugestao", label: "Sugestão", about: "Um som novo, um recurso, uma melhoria." },
  {
    id: "privacidade",
    label: "Privacidade e dados",
    about: "Pedidos da LGPD ou dúvidas sobre o que é guardado.",
  },
  { id: "outro", label: "Outro assunto", about: "Parcerias, imprensa ou qualquer outra coisa." },
] as const;

export type ContactTypeId = (typeof CONTACT_TYPES)[number]["id"];

export const contactType = (id: string | undefined) => CONTACT_TYPES.find((t) => t.id === id);

/** Tempo mínimo (ms) entre abrir o formulário e enviar: robôs costumam enviar na hora. */
export const MIN_FILL_MS = 3000;

export const LIMITS = { name: 80, email: 200, message: 5000 } as const;
