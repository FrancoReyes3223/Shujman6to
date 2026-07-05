import { Request, Response, NextFunction } from 'express'
import { productsService, validatePrice, validateStock } from '../services/products.service'
import { parseSheet } from '../utils/sheetParser'

type AuthRequest = Request & { user: { id: string; email: string } }

export const productsController = {
  async importFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' })
      const { rows, sheetNames } = parseSheet(req.file.buffer)
      const report = await productsService.importRows(userId, workspaceId, rows)
      if (sheetNames.length > 1) {
        report.warnings.push(`El archivo tiene ${sheetNames.length} hojas; solo se importó la primera ("${sheetNames[0]}").`)
      }
      res.json({ success: true, data: report })
    } catch (error) {
      next(error)
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      const products = await productsService.list(userId, workspaceId)
      res.json({ success: true, data: products })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      const { name, category, price, stock, status } = req.body
      if (!name?.trim()) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
      if (!category?.trim()) return res.status(400).json({ success: false, message: 'La categoría es obligatoria' })
      const priceRes = validatePrice(String(price ?? ''))
      if ('error' in priceRes) return res.status(400).json({ success: false, message: priceRes.error.charAt(0).toUpperCase() + priceRes.error.slice(1) })
      const stockRes = validateStock(String(stock ?? ''))
      if ('error' in stockRes) return res.status(400).json({ success: false, message: stockRes.error.charAt(0).toUpperCase() + stockRes.error.slice(1) })
      const product = await productsService.create(userId, workspaceId, { name: name.trim(), category: category.trim(), price: priceRes.value, stock: stockRes.value, status })
      res.status(201).json({ success: true, data: product })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId, productId } = req.params
      const { name, category, price, stock, status } = req.body
      let validatedPrice = price
      let validatedStock = stock
      if (price !== undefined) {
        const priceRes = validatePrice(String(price ?? ''))
        if ('error' in priceRes) return res.status(400).json({ success: false, message: priceRes.error.charAt(0).toUpperCase() + priceRes.error.slice(1) })
        validatedPrice = priceRes.value
      }
      if (stock !== undefined) {
        const stockRes = validateStock(String(stock ?? ''))
        if ('error' in stockRes) return res.status(400).json({ success: false, message: stockRes.error.charAt(0).toUpperCase() + stockRes.error.slice(1) })
        validatedStock = stockRes.value
      }
      const product = await productsService.update(userId, workspaceId, productId, { name, category, price: validatedPrice, stock: validatedStock, status })
      res.json({ success: true, data: product })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId, productId } = req.params
      await productsService.remove(userId, workspaceId, productId)
      res.json({ success: true, message: 'Producto eliminado' })
    } catch (error) {
      next(error)
    }
  },
}
