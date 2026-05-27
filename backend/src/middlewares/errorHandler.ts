import { Request, Response, NextFunction } from 'express'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message)

  if (err.message === 'Credenciales incorrectas') {
    return res.status(401).json({ success: false, message: err.message })
  }

  if (err.message === 'El email ya está registrado') {
    return res.status(409).json({ success: false, message: err.message })
  }

  if (err.message === 'Usuario no encontrado') {
    return res.status(404).json({ success: false, message: err.message })
  }

  res.status(500).json({ success: false, message: 'Error interno del servidor' })
}
