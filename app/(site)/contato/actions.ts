"use server";

import { headers } from "next/headers";
import { LIMITS, MIN_FILL_MS, contactType } from "@/lib/contact";
import { escapeHtml, sendEmail } from "@/lib/email";
import { SITE } from "@/lib/site";

export type ContactState = { error?: string; sent?: boolean; fields?: Record<string, string> } | undefined;

const SHAPE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*
  Limite por IP: 3 envios a cada 10 minutos. Fica na memória da instância (sem banco de dados),
  então é um freio contra repetição, não uma garantia: instâncias novas começam do zero.
*/
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 3;
const recent = new Map<string, number[]>();

function allowed(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return false;
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return true;
}

function field(formData: FormData, name: string) {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

export async function sendContact(_: ContactState, formData: FormData): Promise<ContactState> {
  // Guarda o que foi digitado para devolver ao formulário se algo der errado
  const fields = { tipo: field(formData, "tipo"), nome: field(formData, "nome"), email: field(formData, "email"), mensagem: field(formData, "mensagem") };
  const fail = (error: string): ContactState => ({ error, fields });

  // Armadilhas para robôs: campo invisível preenchido ou envio rápido demais. Finge que deu certo.
  const startedAt = Number(field(formData, "t"));
  if (field(formData, "website") || !startedAt || Date.now() - startedAt < MIN_FILL_MS) return { sent: true };

  const type = contactType(fields.tipo);
  if (!type) return fail("Escolha sobre o que é o contato.");

  const name = fields.nome;
  const email = fields.email.toLowerCase();
  const message = fields.mensagem;
  if (!name) return fail("Diga como podemos te chamar.");
  if (name.length > LIMITS.name) return fail(`O nome pode ter até ${LIMITS.name} caracteres.`);
  if (email.length > LIMITS.email || !SHAPE_EMAIL.test(email)) return fail("Confira o seu e-mail: é por ele que vamos responder.");
  if (message.length < 10) return fail("Conte um pouco mais na mensagem (pelo menos 10 caracteres).");
  if (message.length > LIMITS.message) return fail(`A mensagem pode ter até ${LIMITS.message} caracteres.`);

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  if (ip && !allowed(ip)) return fail("Recebemos várias mensagens daqui agora há pouco. Espere alguns minutos e tente de novo.");

  const meta = [
    { label: "Veio da página", value: field(formData, "origem") || "direto" },
    { label: "Navegador", value: (h.get("user-agent") ?? "—").slice(0, 200) },
  ];

  // Assunto padronizado, para os filtros do e-mail: "[coffe] Sugestão · Fulano"
  const subject = `[coffe] ${type.label} · ${name}`.slice(0, 180);
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6d6051;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
    `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`;
  const html =
    `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#362f28;max-width:640px">` +
    `<p style="margin:0 0 4px;color:#c65a1e;font-weight:600">${escapeHtml(type.label)}</p>` +
    `<p style="margin:0 0 16px">De <strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;. Responda este e-mail para falar com a pessoa.</p>` +
    `<p style="white-space:pre-wrap;margin:0 0 20px">${escapeHtml(message)}</p>` +
    `<hr style="border:none;border-top:1px solid #e0d2b8;margin:20px 0"><table style="border-collapse:collapse;font-size:13px">${meta.map((m) => row(m.label, m.value)).join("")}</table>` +
    `</div>`;
  const text = [type.label, `De ${name} <${email}>`, "", message, "", "---", ...meta.map((m) => `${m.label}: ${m.value}`)].join("\n");

  const result = await sendEmail({ to: SITE.contactEmail, replyTo: email, subject, text, html });
  if (!result.ok) {
    console.error("[contato] falha no envio:", result.reason);
    return fail(`Não conseguimos enviar agora. Tente de novo em instantes ou escreva direto para ${SITE.contactEmail}.`);
  }
  return { sent: true };
}
