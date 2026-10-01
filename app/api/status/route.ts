import { APP_VERSION, COMMIT_SHA, DEPLOY_ENV } from "@/lib/version";

// Usado pela página /sistema para confirmar que o site responde. Nunca em cache.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { ok: true, version: APP_VERSION, commit: COMMIT_SHA, env: DEPLOY_ENV, time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
