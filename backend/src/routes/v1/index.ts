import { Router } from 'express'
import authRoutes from './auth.routes'
import usuariosRoutes from './usuarios.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/usuarios', usuariosRoutes)

export default router
