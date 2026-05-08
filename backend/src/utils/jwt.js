// utils/jwt.js
// Funciones auxiliares para generar y verificar tokens JWT.
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'mi-secreto-temporal'

export const generarToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET)
}
