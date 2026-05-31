import { Router } from 'express'
import authRoutes from './auth.routes'
import usuariosRoutes from './usuarios.routes'
import workspacesRoutes from './workspaces.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/usuarios', usuariosRoutes)
router.use('/workspaces', workspacesRoutes)

export default router
