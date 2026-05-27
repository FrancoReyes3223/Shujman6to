import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export const authMiddleware = {
  verifyToken(req: Request, res: Response, next: NextFunction) {
    let token: string | null = null
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' })
    }

    try {
      const decoded = verifyToken(token)
      ;(req as Request & { user: unknown }).user = decoded
      next()
    } catch {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado' })
    }
  }
}
