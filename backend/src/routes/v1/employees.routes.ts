import { Router } from 'express'
import { employeesController } from '../../controllers/employees.controller'
import { authMiddleware } from '../../middlewares/auth'
import { uploadSheet } from '../../utils/uploadSheet'

const router = Router({ mergeParams: true })

router.use(authMiddleware.verifyToken)

router.get('/', employeesController.list)
router.post('/', employeesController.create)
router.post('/import', uploadSheet, employeesController.importFile)
router.patch('/:employeeId', employeesController.update)
router.delete('/:employeeId', employeesController.remove)

export default router
