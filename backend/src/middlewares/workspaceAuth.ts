import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extender la interfaz Request para TypeScript
export interface AuthRequest extends Request {
  user?: any;
  workspaceRole?: string;
}

export const workspaceAuth = {
  /**
   * Middleware para verificar que el usuario pertenece al workspace.
   * Se espera que el workspaceId venga en req.params.workspaceId o en req.headers['x-workspace-id']
   */
  async requireAccess(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' })
      }

      // Obtener el workspaceId de los parámetros o headers
      const workspaceId = req.params.workspaceId || req.headers['x-workspace-id']

      if (!workspaceId || typeof workspaceId !== 'string') {
        return res.status(400).json({ success: false, message: 'Falta especificar el workspaceId' })
      }

      // Buscar si el usuario es miembro de este workspace
      const member = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: userId,
            workspaceId: workspaceId
          }
        }
      })

      if (!member) {
        return res.status(403).json({ success: false, message: 'No tienes acceso a este workspace' })
      }

      // Guardamos el rol del usuario en la request para usarlo en controladores o en el próximo middleware
      req.workspaceRole = member.role
      
      next()
    } catch (error) {
      console.error('Error en workspaceAuth:', error)
      return res.status(500).json({ success: false, message: 'Error interno de validación' })
    }
  },

  /**
   * Middleware para requerir que el usuario sea ADMIN o OWNER
   * Debe ejecutarse SIEMPRE después de requireAccess
   */
  requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.workspaceRole !== 'ADMIN' && req.workspaceRole !== 'OWNER') {
      return res.status(403).json({ success: false, message: 'Se requieren permisos de administrador' })
    }
    next()
  },

  /**
   * Middleware para requerir que el usuario sea el OWNER absoluto
   * Debe ejecutarse SIEMPRE después de requireAccess
   */
  requireOwner(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.workspaceRole !== 'OWNER') {
      return res.status(403).json({ success: false, message: 'Se requieren permisos de propietario' })
    }
    next()
  }
}
