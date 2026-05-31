import { Router } from 'express'
import { getEmployees, createEmployee, deleteEmployee } from '../../controllers/employees.controller'
import { authMiddleware } from '../../middlewares/auth'
import { workspaceAuth } from '../../middlewares/workspaceAuth'

const router = Router({ mergeParams: true })

router.use(authMiddleware.verifyToken)
router.use(workspaceAuth.requireAccess)

// GET /api/v1/workspaces/:workspaceId/employees
router.get('/', getEmployees)

// POST /api/v1/workspaces/:workspaceId/employees (ADMIN o OWNER)
router.post('/', workspaceAuth.requireAdmin, createEmployee)

// DELETE /api/v1/workspaces/:workspaceId/employees/:id (ADMIN o OWNER)
router.delete('/:id', workspaceAuth.requireAdmin, deleteEmployee)

export default router
