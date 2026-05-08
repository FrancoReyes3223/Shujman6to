// controllers/usuarios.controller.js
// Capa de manejo HTTP para usuarios.
import { usuariosService } from '../services/usuarios.service.js'

export const usuariosController = {
  async obtenerPerfil(req, res, next) {
    try {
      const usuario = await usuariosService.obtenerPorId(req.user.id)
      res.json({
        success: true,
        data: usuario
      })
    } catch (error) {
      next(error)
    }
  }
}
