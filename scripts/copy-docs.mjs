import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsDist = resolve(root, 'docs/dist')
const publicDocs = resolve(root, 'frontend/public/docs')

if (!existsSync(docsDist)) {
  console.error('Error: docs/dist no existe. Corré "npm run build:docs" primero.')
  process.exit(1)
}

if (existsSync(publicDocs)) rmSync(publicDocs, { recursive: true })
mkdirSync(publicDocs, { recursive: true })

cpSync(docsDist, publicDocs, { recursive: true })

// Con i18n activado, Starlight no genera index.html en la raíz.
// Generamos un redirector que apunta al idioma por defecto (es).
const indexRedirect = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=./es/">
    <title>Shujman — Documentación</title>
    <link rel="canonical" href="./es/">
  </head>
  <body>
    <p>Redirigiendo a <a href="./es/">la documentación</a>…</p>
  </body>
</html>
`
writeFileSync(resolve(publicDocs, 'index.html'), indexRedirect)

console.log('Docs copiados a frontend/public/docs/ (con redirector raíz)')
