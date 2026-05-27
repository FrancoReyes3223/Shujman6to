import prisma from '../config/database'

export const usuarioRepository = {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } })
  },

  async create(data: { email: string; password: string; fullName?: string }) {
    return await prisma.user.create({ data })
  },

  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } })
  },

  async update(id: string, data: Partial<{ email: string; password: string; fullName: string }>) {
    return await prisma.user.update({ where: { id }, data })
  },

  async delete(id: string) {
    return await prisma.user.delete({ where: { id } })
  }
}
