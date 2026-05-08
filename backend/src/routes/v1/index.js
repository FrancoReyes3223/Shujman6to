// routes/v1/index.js
// Agrupa todas las rutas de la versión 1.
import { Router } from 'express'
import authRoutes from './auth.routes.js'
import usuariosRoutes from './usuarios.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/usuarios', usuariosRoutes)

export default router
