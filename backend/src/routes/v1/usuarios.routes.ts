import { Router } from 'express'
import { usuariosController, uploadAvatar } from '../../controllers/usuarios.controller'
import { authMiddleware } from '../../middlewares/auth'

const router = Router()

router.get('/perfil', authMiddleware.verifyToken, usuariosController.obtenerPerfil)
router.patch('/perfil', authMiddleware.verifyToken, usuariosController.actualizarPerfil)
router.delete('/perfil', authMiddleware.verifyToken, usuariosController.eliminarCuenta)
router.patch('/password', authMiddleware.verifyToken, usuariosController.cambiarPassword)
router.post('/avatar', authMiddleware.verifyToken, uploadAvatar, usuariosController.subirAvatar)

export default router
