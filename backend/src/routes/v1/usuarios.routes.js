// routes/v1/usuarios.routes.js
// Rutas de usuarios (protegidas con autenticación).
import { Router } from 'express'
import { usuariosController } from '../../controllers/usuarios.controller.js'
import { authMiddleware } from '../../middlewares/auth.js'

const router = Router()

// Obtener perfil del usuario autenticado
router.get('/perfil', authMiddleware.verifyToken, usuariosController.obtenerPerfil)

export default router
