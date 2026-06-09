import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import { companyService } from '../services/company.service'

type AuthRequest = Request & { user: { id: string; email: string } }

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `founder-${Date.now()}${ext}`)
  },
})

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  },
}).single('photo')

export const companyController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      const company = await companyService.get(userId, workspaceId)
      res.json({ success: true, data: company })
    } catch (error) {
      next(error)
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      const { name, location, description } = req.body
      if (!name?.trim()) return res.status(400).json({ success: false, message: 'El nombre de la empresa es obligatorio' })
      const company = await companyService.upsert(userId, workspaceId, { name: name.trim(), location, description })
      res.json({ success: true, data: company })
    } catch (error) {
      next(error)
    }
  },

  async listFounders(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      const founders = await companyService.listFounders(userId, workspaceId)
      res.json({ success: true, data: founders })
    } catch (error) {
      next(error)
    }
  },

  async createFounder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      const { name, initials, color, quote } = req.body
      if (!name?.trim()) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
      if (!initials?.trim()) return res.status(400).json({ success: false, message: 'Las iniciales son obligatorias' })
      if (!color?.trim()) return res.status(400).json({ success: false, message: 'El color es obligatorio' })
      const founder = await companyService.createFounder(userId, workspaceId, { name: name.trim(), initials: initials.trim(), color: color.trim(), quote })
      res.status(201).json({ success: true, data: founder })
    } catch (error) {
      next(error)
    }
  },

  async updateFounder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId, founderId } = req.params
      const { name, initials, color, quote } = req.body
      const founder = await companyService.updateFounder(userId, workspaceId, founderId, { name, initials, color, quote })
      res.json({ success: true, data: founder })
    } catch (error) {
      next(error)
    }
  },

  async uploadFounderPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId, founderId } = req.params
      if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió ninguna imagen' })
      const photoUrl = `/uploads/${req.file.filename}`
      const founder = await companyService.updateFounder(userId, workspaceId, founderId, { photoUrl })
      res.json({ success: true, data: founder })
    } catch (error) {
      next(error)
    }
  },

  async removeFounder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId, founderId } = req.params
      await companyService.removeFounder(userId, workspaceId, founderId)
      res.json({ success: true, message: 'Fundador eliminado' })
    } catch (error) {
      next(error)
    }
  },
}
