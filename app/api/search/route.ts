import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// Busca da documentação (/docs). O índice é montado a partir do MDX no build.
export const { GET } = createFromSource(source);
