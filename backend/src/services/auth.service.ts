import { usuarioRepository } from '../repositories/usuario.repository'
import { generarToken } from '../utils/jwt'
import { hashPassword, comparePassword } from '../utils/bcrypt'

export const authService = {
  async login(email: string, password: string) {
    const usuario = await usuarioRepository.findByEmail(email)
    if (!usuario) throw new Error('Credenciales incorrectas')

    const valido = await comparePassword(password, usuario.password)
    if (!valido) throw new Error('Credenciales incorrectas')

    const token = generarToken({ id: usuario.id, email: usuario.email })
    const { password: _, ...usuarioSinPassword } = usuario
    return { token, usuario: usuarioSinPassword }
  },

  async register(data: { email: string; password: string; fullName?: string }) {
    const existe = await usuarioRepository.findByEmail(data.email)
    if (existe) throw new Error('El email ya está registrado')

    const hashedPassword = await hashPassword(data.password)
    const usuario = await usuarioRepository.create({ ...data, password: hashedPassword })

    const token = generarToken({ id: usuario.id, email: usuario.email })
    const { password: _, ...usuarioSinPassword } = usuario
    return { token, usuario: usuarioSinPassword }
  }
}
