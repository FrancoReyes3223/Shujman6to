// controllers/auth.controller.js
// Capa de manejo HTTP para autenticación.
// Solo extrae datos de req, llama al servicio y envía la respuesta.
// NO contiene lógica de negocio ni accede a la BD.
import { authService } from '../services/auth.service.js'

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const resultado = await authService.login(email, password)
      res.json({
        success: true,
        data: resultado,
        message: 'Login exitoso'
      })
    } catch (error) {
      next(error) // Pasa al manejador de errores
    }
  },

  async register(req, res, next) {
    try {
      const { email, password, fullName } = req.body
      const resultado = await authService.register({ email, password, fullName })
      res.status(201).json({
        success: true,
        data: resultado,
        message: 'Usuario registrado exitosamente'
      })
    } catch (error) {
      next(error)
    }
  }
}
