import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'mi-secreto-temporal'

export const generarToken = (payload: object) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET)
}
