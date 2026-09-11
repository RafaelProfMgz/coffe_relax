"use client";

import { ConsentProvider } from "@/hooks/useConsent";
import CookieBanner from "@/components/CookieBanner";

/** Consentimento vale para o site inteiro, inclusive as páginas legais. */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      {children}
      <CookieBanner />
    </ConsentProvider>
  );
}
