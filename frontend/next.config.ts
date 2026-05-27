import type { NextConfig } from "next";

// Reemplazá "USUARIO" con tu usuario del servidor (ej: "dos", "tres", etc.)
const USUARIO = "USUARIO";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/~${USUARIO}`,
  assetPrefix: `/~${USUARIO}/`,
  trailingSlash: true,
};

export default nextConfig;
