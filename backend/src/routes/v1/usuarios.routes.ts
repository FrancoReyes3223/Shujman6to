import { Router } from 'express'
import { usuariosController } from '../../controllers/usuarios.controller'
import { authMiddleware } from '../../middlewares/auth'

const router = Router()

router.get('/perfil', authMiddleware.verifyToken, usuariosController.obtenerPerfil)

export default router
