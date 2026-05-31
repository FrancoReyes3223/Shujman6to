import { Router } from 'express'
import { createWorkspace, getWorkspaces, inviteUser } from '../../controllers/workspaces.controller'
import { authMiddleware } from '../../middlewares/auth'
import { workspaceAuth } from '../../middlewares/workspaceAuth'
import productsRoutes from './products.routes'
import transactionsRoutes from './transactions.routes'
import employeesRoutes from './employees.routes'

const router = Router()

// Todas las rutas de workspaces requieren estar autenticado
router.use(authMiddleware.verifyToken)

// GET /api/v1/workspaces - Obtener los workspaces del usuario
router.get('/', getWorkspaces)

// POST /api/v1/workspaces - Crear un nuevo workspace
router.post('/', createWorkspace)

// POST /api/v1/workspaces/:workspaceId/invite - Invitar usuario (solo ADMIN o OWNER)
router.post(
  '/:workspaceId/invite', 
  workspaceAuth.requireAccess, // 1. Verifica si pertenece a la empresa
  workspaceAuth.requireAdmin,  // 2. Verifica si tiene rol ADMIN u OWNER
  inviteUser
)

// Montar sub-rutas dependientes del workspaceId
router.use('/:workspaceId/products', productsRoutes)
router.use('/:workspaceId/transactions', transactionsRoutes)
router.use('/:workspaceId/employees', employeesRoutes)

export default router
