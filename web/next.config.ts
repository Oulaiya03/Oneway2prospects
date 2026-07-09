import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // web/ est la racine du projet Next (évite l'inférence sur les lockfiles parents
  // et la génération de fichiers parasites à la racine du monorepo).
  turbopack: { root: __dirname },
};

export default nextConfig;
