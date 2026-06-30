import { Router } from 'express'
import { productsController } from '../../controllers/products.controller'
import { authMiddleware } from '../../middlewares/auth'
import { uploadSheet } from '../../utils/uploadSheet'

const router = Router({ mergeParams: true })

router.use(authMiddleware.verifyToken)

router.get('/', productsController.list)
router.post('/', productsController.create)
router.post('/import', uploadSheet, productsController.importFile)
router.patch('/:productId', productsController.update)
router.delete('/:productId', productsController.remove)

export default router
