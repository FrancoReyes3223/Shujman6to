import { Request, Response, NextFunction } from 'express'
import { usuariosService } from '../services/usuarios.service'

export const usuariosController = {
  async obtenerPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: { id: string } }).user
      const usuario = await usuariosService.obtenerPorId(user.id)
      res.json({ success: true, data: usuario })
    } catch (error) {
      next(error)
    }
  }
}
