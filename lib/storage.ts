"use client";

/**
 * Camada fina sobre o localStorage que respeita o consentimento do usuário.
 *
 * Regra: nada de preferências é gravado antes de o usuário aceitar.
 * O registro do próprio consentimento é a única exceção — ele é
 * estritamente necessário para não perguntarmos de novo a cada visita.
 */

export const CONSENT_KEY = "coffe_consent_v1";

/** Chaves de preferência que dependem do consentimento. */
export const PREFERENCE_KEYS = [
  "coffe_yt_library_v2",
  "coffe_yt_library",
  "coffe_notes",
  "coffe_volume",
  "coffe_muted",
  "coffe_focus",
] as const;

let allowed = false;

export function setStorageAllowed(value: boolean) {
  allowed = value;
}

export function isStorageAllowed() {
  return allowed;
}

/** Leitura/escrita bloqueadas enquanto o usuário não autorizar preferências. */
export const store = {
  get(key: string): string | null {
    if (!allowed || typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    if (!allowed || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* cota cheia ou storage bloqueado */
    }
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* storage bloqueado */
    }
  },
};

/** Chamado quando o usuário revoga o consentimento: apaga tudo que guardamos. */
export function purgePreferences() {
  PREFERENCE_KEYS.forEach((key) => store.remove(key));
}

/** O registro de consentimento ignora o bloqueio — é a base de tudo. */
export const consentStore = {
  read(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  },
  write(value: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* storage bloqueado — seguimos só com a sessão atual */
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(CONSENT_KEY);
    } catch {
      /* storage bloqueado */
    }
  },
};
