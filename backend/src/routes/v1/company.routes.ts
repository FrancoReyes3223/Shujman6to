import { Router } from 'express'
import { companyController, uploadPhoto } from '../../controllers/company.controller'
import { authMiddleware } from '../../middlewares/auth'

const router = Router({ mergeParams: true })

router.use(authMiddleware.verifyToken)

router.get('/', companyController.get)
router.put('/', companyController.upsert)
router.get('/founders', companyController.listFounders)
router.post('/founders', companyController.createFounder)
router.patch('/founders/:founderId', companyController.updateFounder)
router.post('/founders/:founderId/photo', uploadPhoto, companyController.uploadFounderPhoto)
router.delete('/founders/:founderId', companyController.removeFounder)

export default router
