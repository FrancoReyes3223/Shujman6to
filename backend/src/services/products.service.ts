import { PrismaClient, Product } from '@prisma/client'
import { workspacesService } from './workspaces.service'
import { rowGetter, normalizeKey } from '../utils/sheetParser'
import type { ImportReport } from './employees.service'

const prisma = new PrismaClient()

/** Mapea un status (en cualquier idioma) al valor canónico de la DB; default "Normal". */
function normalizeProductStatus(raw: string): string {
  const s = normalizeKey(raw)
  if (['normal'].includes(s)) return 'Normal'
  if (['low', 'bajo', 'bajo stock', 'stock bajo'].includes(s)) return 'Low'
  if (['out of stock', 'sin stock', 'agotado', 'no stock'].includes(s)) return 'Out of Stock'
  return 'Normal'
}

/** Valida un precio: opcional; admite $, espacios y separadores de miles. Devuelve el valor canónico ($X.XX) o un error. */
export function validatePrice(raw: string): { value: string } | { error: string } {
  if (!raw) return { value: '' }
  const cleaned = raw.replace(/[$\s,]/g, '')
  const num = Number(cleaned)
  if (!Number.isFinite(num) || num < 0) return { error: `precio inválido: "${raw}"` }
  return { value: `$${num.toFixed(2)}` } // formato canónico unificado (manual e import)
}

/** Valida un stock: opcional; debe ser un entero >= 0. */
export function validateStock(raw: string): { value: string } | { error: string } {
  if (!raw) return { value: '' }
  const cleaned = raw.replace(/[\s,]/g, '')
  if (!/^\d+$/.test(cleaned)) return { error: `stock inválido: "${raw}" (debe ser un entero >= 0)` }
  return { value: cleaned }
}

export const productsService = {
  async list(userId: string, workspaceId: string) {
    await workspacesService.requireMember(userId, workspaceId)
    return prisma.product.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    })
  },

  async create(userId: string, workspaceId: string, data: { name: string; category: string; price: string; stock: string; status?: string }) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    return prisma.product.create({
      data: { ...data, workspaceId },
    })
  },

  async update(userId: string, workspaceId: string, productId: string, data: { name?: string; category?: string; price?: string; stock?: string; status?: string }) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    const product = await prisma.product.findFirst({ where: { id: productId, workspaceId } })
    if (!product) throw new Error('Producto no encontrado')
    return prisma.product.update({ where: { id: productId }, data })
  },

  async remove(userId: string, workspaceId: string, productId: string) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    const product = await prisma.product.findFirst({ where: { id: productId, workspaceId } })
    if (!product) throw new Error('Producto no encontrado')
    return prisma.product.delete({ where: { id: productId } })
  },

  /** Importa filas (de un CSV/Excel ya parseado) en modo append, salteando inválidas y duplicadas. */
  async importRows(userId: string, workspaceId: string, rawRows: Record<string, unknown>[]): Promise<ImportReport<Product>> {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)

    type ProdData = { name: string; category: string; price: string; stock: string; status: string }
    const candidates: { row: number; data: ProdData }[] = []
    const errors: { row: number; message: string }[] = []

    rawRows.forEach((raw, i) => {
      const rowNum = i + 2
      const get = rowGetter(raw)
      const name = get('name', 'nombre', 'producto')
      const category = get('category', 'categoria', 'rubro')
      const price = get('price', 'precio')
      const stock = get('stock', 'inventario', 'cantidad')
      const status = get('status', 'estado')

      if (!name && !category && !price && !stock && !status) return

      const problems: string[] = []
      const missing: string[] = []
      if (!name) missing.push('name')
      if (!category) missing.push('category')
      if (missing.length) problems.push(`faltan campos obligatorios: ${missing.join(', ')}`)

      const priceResult = validatePrice(price)
      if ('error' in priceResult) problems.push(priceResult.error)
      const stockResult = validateStock(stock)
      if ('error' in stockResult) problems.push(stockResult.error)

      if (problems.length) {
        errors.push({ row: rowNum, message: problems.join('; ') })
        return
      }

      candidates.push({
        row: rowNum,
        data: {
          name,
          category,
          price: (priceResult as { value: string }).value,
          stock: (stockResult as { value: string }).value,
          status: normalizeProductStatus(status),
        },
      })
    })

    // Deduplicación por nombre (contra la DB y dentro del archivo)
    const existing = await prisma.product.findMany({ where: { workspaceId }, select: { name: true } })
    const seen = new Set(existing.map((p) => normalizeKey(p.name)))
    let duplicates = 0
    const toInsert: ProdData[] = []
    for (const c of candidates) {
      const key = normalizeKey(c.data.name)
      if (seen.has(key)) {
        duplicates++
        errors.push({ row: c.row, message: `Duplicado: ya existe un producto "${c.data.name}"` })
        continue
      }
      seen.add(key)
      toInsert.push(c.data)
    }

    const created = toInsert.length
      ? await prisma.$transaction(toInsert.map((d) => prisma.product.create({ data: { ...d, workspaceId } })))
      : []

    return { inserted: created.length, skipped: errors.length, duplicates, errors, warnings: [], created }
  },
}
