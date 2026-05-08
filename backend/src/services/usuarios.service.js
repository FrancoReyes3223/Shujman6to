// services/usuarios.service.js
// Capa de lógica de negocio para usuarios.
import { usuarioRepository } from '../repositories/usuario.repository.js'

export const usuariosService = {
  async obtenerPorId(id) {
    const usuario = await usuarioRepository.findById(id)
    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }
    const { password: _, ...usuarioSinPassword } = usuario
    return usuarioSinPassword
  }
}
