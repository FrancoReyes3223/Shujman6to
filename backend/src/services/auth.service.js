// services/auth.service.js
// Capa de lógica de negocio para autenticación.
// NO maneja req/res HTTP, solo recibe datos y devuelve resultados.
import { usuarioRepository } from '../repositories/usuario.repository.js'
import { generarToken } from '../utils/jwt.js'
import { hashPassword, comparePassword } from '../utils/bcrypt.js'

export const authService = {
  async login(email, password) {
    // 1. Buscar usuario
    const usuario = await usuarioRepository.findByEmail(email)
    if (!usuario) {
      throw new Error('Credenciales incorrectas')
    }

    // 2. Verificar password
    const valido = await comparePassword(password, usuario.password)
    if (!valido) {
      throw new Error('Credenciales incorrectas')
    }

    // 3. Generar token
    const token = generarToken({ id: usuario.id, email: usuario.email })

    // 4. No enviar la contraseña
    const { password: _, ...usuarioSinPassword } = usuario
    return { token, usuario: usuarioSinPassword }
  },

  async register(data) {
    // 1. Verificar si ya existe
    const existe = await usuarioRepository.findByEmail(data.email)
    if (existe) {
      throw new Error('El email ya está registrado')
    }

    // 2. Hashear password
    const hashedPassword = await hashPassword(data.password)

    // 3. Crear usuario
    const usuario = await usuarioRepository.create({
      ...data,
      password: hashedPassword
    })

    // 4. Generar token
    const token = generarToken({ id: usuario.id, email: usuario.email })
    const { password: _, ...usuarioSinPassword } = usuario
    return { token, usuario: usuarioSinPassword }
  }
}
