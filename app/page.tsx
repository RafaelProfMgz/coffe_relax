"use client";

import { SoundProvider } from "@/hooks/useSound";
import Workspace from "@/components/Workspace";

export default function HomePage() {
  return (
    <SoundProvider>
      <Workspace />
    </SoundProvider>
  );
}
