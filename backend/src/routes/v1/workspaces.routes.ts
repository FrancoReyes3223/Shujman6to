import { Router } from 'express'
import { workspacesController } from '../../controllers/workspaces.controller'
import { authMiddleware } from '../../middlewares/auth'

const router = Router()

// Todos los endpoints requieren autenticación
router.use(authMiddleware.verifyToken)

// CRUD de workspace
router.post('/', workspacesController.create)
router.get('/', workspacesController.list)
router.get('/:id', workspacesController.getById)
router.patch('/:id', workspacesController.update)

// Gestión de miembros
router.post('/:id/members', workspacesController.addMember)
router.patch('/:id/members/:userId', workspacesController.updateMemberRole)
router.delete('/:id/members/:userId', workspacesController.removeMember)

export default router
