import { usuarioRepository } from '../repositories/usuario.repository'

export const usuariosService = {
  async obtenerPorId(id: string) {
    const usuario = await usuarioRepository.findById(id)
    if (!usuario) throw new Error('Usuario no encontrado')
    const { password: _, ...usuarioSinPassword } = usuario
    return usuarioSinPassword
  }
}
