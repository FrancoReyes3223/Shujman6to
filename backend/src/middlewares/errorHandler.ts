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

  if (err.message === 'La contraseña actual es incorrecta') {
    return res.status(400).json({ success: false, message: err.message })
  }

  if (err.message === 'No eres miembro de este workspace') {
    return res.status(403).json({ success: false, message: err.message })
  }

  if (err.message === 'No tienes permisos para realizar esta acción') {
    return res.status(403).json({ success: false, message: err.message })
  }

  // Errores de subida de archivos (multer) y validación de formato
  if (err.name === 'MulterError' || err.message.startsWith('Formato no soportado')) {
    return res.status(400).json({ success: false, message: err.message })
  }

  if (err.message.startsWith('El owner no puede abandonar')) {
    return res.status(400).json({ success: false, message: err.message })
  }

  if (err.message.startsWith('No podés eliminar tu cuenta mientras seas owner')) {
    return res.status(409).json({ success: false, message: err.message })
  }

  res.status(500).json({ success: false, message: 'Error interno del servidor' })
}
