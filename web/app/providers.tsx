"use client";

import { SessionProvider } from "next-auth/react";

// Fournit la session NextAuth (login Google) à toute l'app.
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
