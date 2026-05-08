// middlewares/auth.js
// Middleware de autenticación: verifica el token JWT.
import { verifyToken } from '../utils/jwt.js'

export const authMiddleware = {
  verifyToken(req, res, next) {
    let token = null
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      })
    }

    try {
      const decoded = verifyToken(token)
      req.user = decoded
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      })
    }
  }
}
