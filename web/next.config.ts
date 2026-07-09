import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  // Racine = racine du monorepo (parent de web/), pour que Next/Turbopack transpile
  // agent/ et integrations/ importés par web/app/api/run (câblage front ↔ back réel).
  turbopack: { root: join(__dirname, "..") },
};

export default nextConfig;
