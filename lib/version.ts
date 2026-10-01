import pkg from "@/package.json";

/** Versão do app e o commit publicado (a Vercel informa o commit nos deploys feitos pelo git). */
export const APP_VERSION = pkg.version;
export const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null;
export const DEPLOY_ENV = process.env.VERCEL_ENV ?? "local";
