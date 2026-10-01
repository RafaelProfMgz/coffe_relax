import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // O app e a documentação têm layouts raiz separados: a 404 de endereços inexistentes vem de app/global-not-found.tsx
    globalNotFound: true,
  },
  async redirects() {
    return [
      // O endereço antigo da Vercel manda para o subdomínio próprio, para buscadores e links compartilhados
      // passarem a apontar para ele. Os previews têm outros endereços e não são afetados.
      {
        source: "/:path*",
        has: [{ type: "host", value: "coffe-relax.vercel.app" }],
        destination: "https://coffe.lotmhub.com.br/:path*",
        permanent: true,
      },
    ];
  },
};

// Fumadocs: compila a documentação em MDX de content/docs (/docs)
const withMDX = createMDX();

export default withMDX(nextConfig);
