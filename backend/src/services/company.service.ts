import { PrismaClient, WorkspaceRole } from '@prisma/client'
import { workspacesService } from './workspaces.service'

const prisma = new PrismaClient()

export const companyService = {
  async get(userId: string, workspaceId: string) {
    await workspacesService.requireMember(userId, workspaceId)
    return prisma.company.findUnique({
      where: { workspaceId },
      include: { founders: { orderBy: { createdAt: 'asc' } } },
    })
  },

  async upsert(userId: string, workspaceId: string, data: { name: string; location?: string; description?: string }) {
    await workspacesService.requireRole(userId, workspaceId, WorkspaceRole.OWNER)
    return prisma.company.upsert({
      where: { workspaceId },
      update: data,
      create: { ...data, workspaceId },
    })
  },

  async listFounders(userId: string, workspaceId: string) {
    await workspacesService.requireMember(userId, workspaceId)
    const company = await prisma.company.findUnique({ where: { workspaceId } })
    if (!company) return []
    return prisma.founder.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'asc' },
    })
  },

  async createFounder(userId: string, workspaceId: string, data: { name: string; initials: string; color: string; quote?: string }) {
    await workspacesService.requireRole(userId, workspaceId, WorkspaceRole.OWNER)
    const company = await prisma.company.findUnique({ where: { workspaceId } })
    if (!company) throw new Error('La empresa no existe aún. Creala primero.')
    return prisma.founder.create({ data: { ...data, companyId: company.id } })
  },

  async updateFounder(userId: string, workspaceId: string, founderId: string, data: { name?: string; initials?: string; color?: string; quote?: string; photoUrl?: string }) {
    await workspacesService.requireRole(userId, workspaceId, WorkspaceRole.OWNER)
    const company = await prisma.company.findUnique({ where: { workspaceId } })
    if (!company) throw new Error('Empresa no encontrada')
    const founder = await prisma.founder.findFirst({ where: { id: founderId, companyId: company.id } })
    if (!founder) throw new Error('Fundador no encontrado')
    return prisma.founder.update({ where: { id: founderId }, data })
  },

  async removeFounder(userId: string, workspaceId: string, founderId: string) {
    await workspacesService.requireRole(userId, workspaceId, WorkspaceRole.OWNER)
    const company = await prisma.company.findUnique({ where: { workspaceId } })
    if (!company) throw new Error('Empresa no encontrada')
    const founder = await prisma.founder.findFirst({ where: { id: founderId, companyId: company.id } })
    if (!founder) throw new Error('Fundador no encontrado')
    return prisma.founder.delete({ where: { id: founderId } })
  },
}
