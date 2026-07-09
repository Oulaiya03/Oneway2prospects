"use client";

import { useSession, signIn, signOut } from "next-auth/react";

// Bouton de connexion Google : agenda (Calendar) + drafts (Gmail).
// Déconnecté → « Se connecter avec Google » ; connecté → statut + déconnexion.
export function GoogleConnect() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-[12px] text-faint">…</span>;
  }

  if (session) {
    return (
      <span className="inline-flex items-center gap-2 text-[12px] text-stone">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pine" /> Agenda Google connecté
        </span>
        <button onClick={() => signOut()} className="text-faint underline underline-offset-2 hover:text-ink">
          déconnexion
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-line-strong"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-faint" /> Se connecter avec Google
    </button>
  );
}
