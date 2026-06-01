import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// USUARIO del servidor de la facu. Configurable por env:
//   USUARIO=dos npm run build
const USUARIO = process.env.USUARIO ?? 'USUARIO'

const base = process.env.DOCS_BASE ?? `/~${USUARIO}/docs`

export default defineConfig({
  site: `http://200.3.127.46:8002/~${USUARIO}`,
  base,
  legacy: {
    collections: true,
  },
  integrations: [
    starlight({
      title: 'SchujmanB2B',
      customCss: ['./src/styles/custom.css'],
      components: {
        ThemeSelect: './src/components/ThemeSelect.astro',
        LanguageSelect: './src/components/LanguageSelect.astro',
        SiteTitle: './src/components/SiteTitle.astro',
      },
      defaultLocale: 'es',
      locales: {
        es: { label: 'Español', lang: 'es' },
        en: { label: 'English', lang: 'en' },
      },
      sidebar: [
        {
          label: 'Entregas',
          translations: { en: 'Deliverables' },
          autogenerate: { directory: 'entregas' },
        },
      ],
    }),
  ],
})
