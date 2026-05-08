// repositories/usuario.repository.js
// Capa de acceso a datos: todas las consultas a la tabla "users".
// NO contiene lógica de negocio ni maneja HTTP.
import prisma from '../config/database.js'

export const usuarioRepository = {
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    })
  },

  async create(data) {
    return await prisma.user.create({
      data
    })
  },

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id }
    })
  },

  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data
    })
  },

  async delete(id) {
    return await prisma.user.delete({
      where: { id }
    })
  }
}
