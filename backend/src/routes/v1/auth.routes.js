// routes/v1/auth.routes.js
// Rutas de autenticación (login, register).
import { Router } from 'express'
import { authController } from '../../controllers/auth.controller.js'

const router = Router()

router.post('/login', authController.login)
router.post('/register', authController.register)

export default router
