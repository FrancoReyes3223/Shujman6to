import { Router } from 'express'
import { productsController } from '../../controllers/products.controller'
import { authMiddleware } from '../../middlewares/auth'

const router = Router({ mergeParams: true })

router.use(authMiddleware.verifyToken)

router.get('/', productsController.list)
router.post('/', productsController.create)
router.patch('/:productId', productsController.update)
router.delete('/:productId', productsController.remove)

export default router
