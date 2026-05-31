import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/workspaceAuth'

const prisma = new PrismaClient()

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params

    const products = await prisma.product.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ success: true, data: products })
  } catch (error) {
    console.error('Error al obtener productos:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params
    const { name, description, price, cost, stock } = req.body

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Nombre y precio son requeridos' })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        cost: cost ? Number(cost) : null,
        stock: stock ? Number(stock) : 0,
        workspaceId
      }
    })

    res.status(201).json({ success: true, data: product })
  } catch (error) {
    console.error('Error al crear producto:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, id } = req.params
    const { name, description, price, cost, stock } = req.body

    // Asegurarse de que el producto pertenezca al workspace
    const product = await prisma.product.findFirst({
      where: { id, workspaceId }
    })

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado en este workspace' })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? Number(price) : product.price,
        cost: cost !== undefined ? Number(cost) : product.cost,
        stock: stock !== undefined ? Number(stock) : product.stock
      }
    })

    res.json({ success: true, data: updatedProduct })
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, id } = req.params

    const product = await prisma.product.findFirst({
      where: { id, workspaceId }
    })

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    }

    await prisma.product.delete({
      where: { id }
    })

    res.json({ success: true, message: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}
