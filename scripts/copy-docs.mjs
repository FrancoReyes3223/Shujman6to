import { cpSync, mkdirSync, rmSync, existsSync } from 'fs'
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
console.log('Docs copiados a frontend/public/docs/')
