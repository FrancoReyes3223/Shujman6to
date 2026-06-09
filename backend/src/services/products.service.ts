import { PrismaClient } from '@prisma/client'
import { workspacesService } from './workspaces.service'

const prisma = new PrismaClient()

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
}
