"use client";

import { ConsentProvider } from "@/hooks/useConsent";
import CookieBanner from "@/components/CookieBanner";
import { TooltipProvider } from "@/components/ui/tooltip";

/** Consentimento vale para o site inteiro, inclusive as páginas legais; o TooltipProvider atende os tooltips do shadcn. */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <TooltipProvider delayDuration={300}>
        {children}
        <CookieBanner />
      </TooltipProvider>
    </ConsentProvider>
  );
}
