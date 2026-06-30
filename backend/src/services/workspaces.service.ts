import { PrismaClient, WorkspaceRole } from '@prisma/client'

const prisma = new PrismaClient()

export const workspacesService = {
  /** Crea un workspace y asigna al creador como OWNER */
  async create(userId: string, data: { name: string; description?: string }) {
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: { members: { include: { user: { select: { id: true, email: true, fullName: true } } } } },
    })
    return workspace
  },

  /** Lista todos los workspaces del usuario con su rol */
  async listByUser(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
      orderBy: { joinedAt: 'asc' },
    })
    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      description: m.workspace.description,
      createdAt: m.workspace.createdAt,
      role: m.role,
    }))
  },

  /** Obtiene un workspace por id, verificando que el usuario sea miembro */
  async getById(userId: string, workspaceId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
    if (!membership) throw new Error('No eres miembro de este workspace')

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true, fullName: true } },
          },
        },
      },
    })
    if (!workspace) throw new Error('Workspace no encontrado')
    return { ...workspace, userRole: membership.role }
  },

  /** Edita nombre/descripción — solo OWNER */
  async update(userId: string, workspaceId: string, data: { name?: string; description?: string }) {
    await this.requireRole(userId, workspaceId, WorkspaceRole.OWNER)
    return prisma.workspace.update({
      where: { id: workspaceId },
      data,
    })
  },

  /** Elimina un workspace por completo — solo OWNER (cascada borra members, employees, products, company) */
  async delete(userId: string, workspaceId: string) {
    await this.requireRole(userId, workspaceId, WorkspaceRole.OWNER)
    return prisma.workspace.delete({ where: { id: workspaceId } })
  },

  /** El usuario actual abandona el workspace (no aplica al único OWNER) */
  async leave(userId: string, workspaceId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
    if (!membership) throw new Error('No eres miembro de este workspace')
    if (membership.role === WorkspaceRole.OWNER) {
      const owners = await prisma.workspaceMember.count({
        where: { workspaceId, role: WorkspaceRole.OWNER },
      })
      if (owners <= 1) {
        throw new Error('El owner no puede abandonar el workspace; transferí la propiedad o eliminá el workspace')
      }
    }
    return prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
  },

  /** Agrega un miembro por email — solo OWNER */
  async addMember(userId: string, workspaceId: string, email: string, role: WorkspaceRole) {
    await this.requireRole(userId, workspaceId, WorkspaceRole.OWNER)

    const target = await prisma.user.findUnique({ where: { email } })
    if (!target) throw new Error('Usuario no encontrado con ese email')

    const existing = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: target.id, workspaceId } },
    })
    if (existing) throw new Error('El usuario ya es miembro de este workspace')

    return prisma.workspaceMember.create({
      data: { userId: target.id, workspaceId, role },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    })
  },

  /** Cambia el rol de un miembro — solo OWNER (no puede cambiar su propio rol) */
  async updateMemberRole(userId: string, workspaceId: string, targetUserId: string, role: WorkspaceRole) {
    await this.requireRole(userId, workspaceId, WorkspaceRole.OWNER)
    if (userId === targetUserId) throw new Error('No puedes cambiar tu propio rol')
    if (role === WorkspaceRole.OWNER) throw new Error('No se puede asignar el rol OWNER')

    return prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
      data: { role },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    })
  },

  /** Elimina un miembro — solo OWNER (no puede eliminarse a sí mismo) */
  async removeMember(userId: string, workspaceId: string, targetUserId: string) {
    await this.requireRole(userId, workspaceId, WorkspaceRole.OWNER)
    if (userId === targetUserId) throw new Error('No puedes eliminarte a ti mismo del workspace')

    return prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    })
  },

  /** Helper: verifica que el userId tenga el rol requerido en el workspace */
  async requireRole(userId: string, workspaceId: string, requiredRole: WorkspaceRole) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
    if (!membership) throw new Error('No eres miembro de este workspace')
    if (membership.role !== requiredRole) throw new Error('No tienes permisos para realizar esta acción')
  },

  /** Helper: verifica que el userId sea OWNER o ADMIN (no USER) */
  async requireAtLeastAdmin(userId: string, workspaceId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
    if (!membership) throw new Error('No eres miembro de este workspace')
    if (membership.role === WorkspaceRole.USER) throw new Error('No tienes permisos para realizar esta acción')
  },

  /** Helper: verifica que el userId sea miembro (cualquier rol) */
  async requireMember(userId: string, workspaceId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
    if (!membership) throw new Error('No eres miembro de este workspace')
  },
}
