import { Router } from 'express'
import { getTransactions, createTransaction, deleteTransaction } from '../../controllers/transactions.controller'
import { authMiddleware } from '../../middlewares/auth'
import { workspaceAuth } from '../../middlewares/workspaceAuth'

const router = Router({ mergeParams: true })

router.use(authMiddleware.verifyToken)
router.use(workspaceAuth.requireAccess)

// GET /api/v1/workspaces/:workspaceId/transactions
router.get('/', getTransactions)

// POST /api/v1/workspaces/:workspaceId/transactions (Solo ADMIN o OWNER pueden registrar finanzas)
router.post('/', workspaceAuth.requireAdmin, createTransaction)

// DELETE /api/v1/workspaces/:workspaceId/transactions/:id (Solo OWNER puede borrar registros financieros)
router.delete('/:id', workspaceAuth.requireOwner, deleteTransaction)

export default router
