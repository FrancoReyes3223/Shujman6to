import type { NextConfig } from "next";

// USUARIO del servidor de la facu (ej: "dos", "tres", etc.).
// Se puede pasar por variable de entorno al buildear:
//   USUARIO=dos npm run build
const USUARIO = process.env.USUARIO ?? "USUARIO";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: isDev ? undefined : "export",
  basePath: isDev ? "" : `/~${USUARIO}`,
  assetPrefix: isDev ? "" : `/~${USUARIO}/`,
  trailingSlash: true,
  // En dev necesitamos resolver /docs/<algo>/ a su index.html.
  // En producción Apache lo hace automáticamente con DirectoryIndex.
  async rewrites() {
    if (!isDev) return [];
    return [
      {
        source: "/docs/:path*/",
        destination: "/docs/:path*/index.html",
      },
    ];
  },
};

export default nextConfig;
