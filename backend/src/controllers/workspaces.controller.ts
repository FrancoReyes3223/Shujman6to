import { Request, Response, NextFunction } from 'express'
import { workspacesService } from '../services/workspaces.service'
import { WorkspaceRole } from '@prisma/client'

type AuthRequest = Request & { user: { id: string; email: string } }

export const workspacesController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { name, description } = req.body
      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre del workspace es obligatorio' })
      }
      const workspace = await workspacesService.create(userId, { name: name.trim(), description })
      res.status(201).json({ success: true, data: workspace, message: 'Workspace creado exitosamente' })
    } catch (error) {
      next(error)
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const workspaces = await workspacesService.listByUser(userId)
      res.json({ success: true, data: workspaces })
    } catch (error) {
      next(error)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { id: workspaceId } = req.params
      const workspace = await workspacesService.getById(userId, workspaceId)
      res.json({ success: true, data: workspace })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { id: workspaceId } = req.params
      const { name, description } = req.body
      const workspace = await workspacesService.update(userId, workspaceId, { name, description })
      res.json({ success: true, data: workspace, message: 'Workspace actualizado' })
    } catch (error) {
      next(error)
    }
  },

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { id: workspaceId } = req.params
      const { email, role } = req.body
      if (!email?.trim()) {
        return res.status(400).json({ success: false, message: 'El email del usuario es obligatorio' })
      }
      const validRoles = [WorkspaceRole.ADMIN, WorkspaceRole.USER]
      const memberRole: WorkspaceRole = validRoles.includes(role) ? role : WorkspaceRole.USER
      const member = await workspacesService.addMember(userId, workspaceId, email.trim(), memberRole)
      res.status(201).json({ success: true, data: member, message: 'Miembro añadido al workspace' })
    } catch (error) {
      next(error)
    }
  },

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { id: workspaceId, userId: targetUserId } = req.params
      const { role } = req.body
      const validRoles = [WorkspaceRole.ADMIN, WorkspaceRole.USER]
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Rol inválido. Usar ADMIN o USER' })
      }
      const member = await workspacesService.updateMemberRole(userId, workspaceId, targetUserId, role)
      res.json({ success: true, data: member, message: 'Rol actualizado' })
    } catch (error) {
      next(error)
    }
  },

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { id: workspaceId, userId: targetUserId } = req.params
      await workspacesService.removeMember(userId, workspaceId, targetUserId)
      res.json({ success: true, message: 'Miembro eliminado del workspace' })
    } catch (error) {
      next(error)
    }
  },
}
