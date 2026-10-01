"use client";

import { useActionState, useEffect, useState } from "react";
import { sendContact, type ContactState } from "./actions";
import { CONTACT_TYPES, LIMITS } from "@/lib/contact";
import { SITE } from "@/lib/site";

export default function ContactForm({ initialType, enabled }: { initialType?: string; enabled: boolean }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, undefined);
  // Hora em que o formulário abriu e página de origem: preenchidos só no navegador
  const [startedAt, setStartedAt] = useState("");
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setStartedAt(String(Date.now()));
    setOrigin(document.referrer ? new URL(document.referrer).pathname : "");
  }, []);

  const fields = state?.fields ?? {};
  const defaultType = CONTACT_TYPES.some((t) => t.id === (fields.tipo || initialType))
    ? fields.tipo || initialType!
    : CONTACT_TYPES[0].id;
  const [type, setType] = useState(defaultType);
  const current = CONTACT_TYPES.find((t) => t.id === type);

  if (state?.sent) {
    return (
      <div className="contact-done" role="status">
        <p className="contact-done-title">☕ Mensagem enviada.</p>
        <p>Obrigado por escrever. Respondemos pelo e-mail que você informou, normalmente em poucos dias.</p>
      </div>
    );
  }

  if (!enabled) {
    return (
      <p className="contact-error" role="status">
        O formulário está fora do ar no momento. Escreva para{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> que a mensagem chega do mesmo jeito.
      </p>
    );
  }

  return (
    <form action={action} className="contact-form" noValidate={false}>
      <input type="hidden" name="t" value={startedAt} />
      <input type="hidden" name="origem" value={origin} />
      {/* Armadilha para robôs: invisível para pessoas e leitores de tela */}
      <div className="contact-trap" aria-hidden>
        <label>
          Site
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="contact-field">
        <span>Sobre o que é</span>
        <select name="tipo" defaultValue={defaultType} onChange={(e) => setType(e.target.value)} required>
          {CONTACT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {current && <small>{current.about}</small>}
      </label>

      <div className="contact-row">
        <label className="contact-field">
          <span>Seu nome</span>
          <input name="nome" type="text" required maxLength={LIMITS.name} autoComplete="name" defaultValue={fields.nome} />
        </label>
        <label className="contact-field">
          <span>Seu e-mail</span>
          <input
            name="email"
            type="email"
            required
            maxLength={LIMITS.email}
            autoComplete="email"
            inputMode="email"
            defaultValue={fields.email}
          />
          <small>Só para responder. Não entra em lista nenhuma.</small>
        </label>
      </div>

      <label className="contact-field">
        <span>Mensagem</span>
        <textarea
          name="mensagem"
          required
          rows={7}
          minLength={10}
          maxLength={LIMITS.message}
          placeholder={type === "problema" ? "O que você fez, o que esperava e o que aconteceu. Qual navegador?" : "Escreva com calma..."}
          defaultValue={fields.mensagem}
        />
      </label>

      {state?.error && (
        <p className="contact-error" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn btn-solid" disabled={pending || !startedAt}>
        {pending ? "enviando..." : "enviar mensagem"}
      </button>
    </form>
  );
}
