import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import { usuariosService } from '../services/usuarios.service'

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `avatar-${Date.now()}${ext}`)
  },
})

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  },
}).single('photo')

export const usuariosController = {
  async obtenerPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: { id: string } }).user
      const usuario = await usuariosService.obtenerPorId(user.id)
      res.json({ success: true, data: usuario })
    } catch (error) {
      next(error)
    }
  },

  async actualizarPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: { id: string } }).user
      const { fullName } = req.body
      if (!fullName?.trim()) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
      }
      const usuario = await usuariosService.actualizarPerfil(user.id, { fullName: fullName.trim() })
      res.json({ success: true, data: usuario, message: 'Perfil actualizado' })
    } catch (error) {
      next(error)
    }
  },

  async cambiarPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: { id: string } }).user
      const { actual, nueva } = req.body
      if (!actual || !nueva) {
        return res.status(400).json({ success: false, message: 'Faltan datos de contraseña' })
      }
      if (String(nueva).length < 6) {
        return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' })
      }
      await usuariosService.cambiarPassword(user.id, actual, nueva)
      res.json({ success: true, message: 'Contraseña actualizada' })
    } catch (error) {
      next(error)
    }
  },

  async subirAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: { id: string } }).user
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se recibió ninguna imagen' })
      }
      const photoUrl = `/uploads/${req.file.filename}`
      const usuario = await usuariosService.actualizarFoto(user.id, photoUrl)
      res.json({ success: true, data: usuario, message: 'Foto actualizada' })
    } catch (error) {
      next(error)
    }
  },

  async eliminarCuenta(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as Request & { user: { id: string } }).user
      await usuariosService.eliminarCuenta(user.id)
      res.json({ success: true, message: 'Cuenta eliminada' })
    } catch (error) {
      next(error)
    }
  },
}
