import { Router } from 'express'
import authRoutes from './auth.routes'
import usuariosRoutes from './usuarios.routes'
import workspacesRoutes from './workspaces.routes'
import employeesRoutes from './employees.routes'
import productsRoutes from './products.routes'
import companyRoutes from './company.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/usuarios', usuariosRoutes)
router.use('/workspaces', workspacesRoutes)
router.use('/workspaces/:workspaceId/employees', employeesRoutes)
router.use('/workspaces/:workspaceId/products', productsRoutes)
router.use('/workspaces/:workspaceId/company', companyRoutes)

export default router
