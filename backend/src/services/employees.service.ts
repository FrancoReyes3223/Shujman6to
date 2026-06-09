import { PrismaClient } from '@prisma/client'
import { workspacesService } from './workspaces.service'

const prisma = new PrismaClient()

export const employeesService = {
  async list(userId: string, workspaceId: string) {
    await workspacesService.requireMember(userId, workspaceId)
    return prisma.employee.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    })
  },

  async create(userId: string, workspaceId: string, data: { name: string; role: string; department: string; status?: string }) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    return prisma.employee.create({
      data: { ...data, workspaceId },
    })
  },

  async update(userId: string, workspaceId: string, employeeId: string, data: { name?: string; role?: string; department?: string; status?: string }) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    await this.findOrFail(workspaceId, employeeId)
    return prisma.employee.update({
      where: { id: employeeId },
      data,
    })
  },

  async remove(userId: string, workspaceId: string, employeeId: string) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    await this.findOrFail(workspaceId, employeeId)
    return prisma.employee.delete({ where: { id: employeeId } })
  },

  async findOrFail(workspaceId: string, employeeId: string) {
    const emp = await prisma.employee.findFirst({ where: { id: employeeId, workspaceId } })
    if (!emp) throw new Error('Empleado no encontrado')
    return emp
  },
}
