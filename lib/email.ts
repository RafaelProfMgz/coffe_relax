/**
 * Envio de e-mail pela API do Resend. Só no servidor: precisa de RESEND_API_KEY, que nunca vai para o navegador.
 * O remetente (CONTACT_FROM) precisa ser de um domínio verificado no Resend.
 */
const DEFAULT_SENDER = "coffe to relax <contato@coffe.lotmhub.com.br>";

type Email = { to: string; replyTo?: string; subject: string; text: string; html: string };

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export async function sendEmail(email: Email): Promise<{ ok: true } | { ok: false; reason: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "RESEND_API_KEY não configurada" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM?.trim() || DEFAULT_SENDER,
        to: [email.to],
        reply_to: email.replyTo ? [email.replyTo] : undefined,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { ok: false, reason: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
