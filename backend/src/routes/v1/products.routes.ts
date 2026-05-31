import { Router } from 'express'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../controllers/products.controller'
import { authMiddleware } from '../../middlewares/auth'
import { workspaceAuth } from '../../middlewares/workspaceAuth'

// mergeParams: true es IMPORTANTE aquí porque recibiremos el :workspaceId desde la ruta principal
const router = Router({ mergeParams: true })

router.use(authMiddleware.verifyToken)
router.use(workspaceAuth.requireAccess) // Todas las rutas requieren acceso al workspace

// GET /api/v1/workspaces/:workspaceId/products
router.get('/', getProducts)

// POST /api/v1/workspaces/:workspaceId/products (Requiere ser ADMIN o OWNER)
router.post('/', workspaceAuth.requireAdmin, createProduct)

// PUT /api/v1/workspaces/:workspaceId/products/:id (Requiere ser ADMIN o OWNER)
router.put('/:id', workspaceAuth.requireAdmin, updateProduct)

// DELETE /api/v1/workspaces/:workspaceId/products/:id (Requiere ser ADMIN o OWNER)
router.delete('/:id', workspaceAuth.requireAdmin, deleteProduct)

export default router
