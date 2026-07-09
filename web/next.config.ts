import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine = web/ (le projet Next lui-même). NE PAS pointer sur le monorepo : ça casse
  // le React Client Manifest (SSR des composants client → page qui ne charge plus).
  // L'agent (agent/loop.ts) tourne hors-web via `npm run agent:dev` ; l'UI consomme une fixture.
  turbopack: { root: __dirname },
};

export default nextConfig;
