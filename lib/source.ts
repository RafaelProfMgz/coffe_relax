import { defineDocs } from "fumadocs-mdx/macro";
import { loader } from "fumadocs-core/source";

// Documentação de uso (/docs), escrita em MDX em content/docs
const docs = defineDocs({ dir: "content/docs" });

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
