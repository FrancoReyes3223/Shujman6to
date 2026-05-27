import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// Reemplazá "USUARIO" con tu usuario del servidor (ej: "dos", "tres", etc.)
// Tiene que ser el mismo valor que en frontend/next.config.ts
const USUARIO = 'USUARIO'

export default defineConfig({
  site: `http://200.3.127.46:8002/~${USUARIO}`,
  base: `/~${USUARIO}/docs`,
  legacy: {
    collections: true,
  },
  integrations: [
    starlight({
      title: 'Shujman — Documentación',
      defaultLocale: 'es',
      sidebar: [
        {
          label: 'Entregas',
          autogenerate: { directory: 'entregas' },
        },
      ],
    }),
  ],
})
