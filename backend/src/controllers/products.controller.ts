import { Request, Response, NextFunction } from 'express'
import { productsService } from '../services/products.service'

type AuthRequest = Request & { user: { id: string; email: string } }

export const productsController = {
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
      const product = await productsService.create(userId, workspaceId, { name: name.trim(), category: category.trim(), price: price ?? '', stock: stock ?? '', status })
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
      const product = await productsService.update(userId, workspaceId, productId, { name, category, price, stock, status })
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
