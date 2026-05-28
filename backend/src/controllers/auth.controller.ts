import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      const resultado = await authService.login(email, password)
      res.json({ success: true, data: resultado, message: 'Login exitoso' })
    } catch (error) {
      next(error)
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName } = req.body
      const resultado = await authService.register({ email, password, fullName })
      res.status(201).json({ success: true, data: resultado, message: 'Usuario registrado exitosamente' })
    } catch (error) {
      next(error)
    }
  }
}
