import fs from 'fs'
import path from 'path'
import { usuarioRepository } from '../repositories/usuario.repository'
import { comparePassword, hashPassword } from '../utils/bcrypt'
import prisma from '../config/database'

export const usuariosService = {
  async obtenerPorId(id: string) {
    const usuario = await usuarioRepository.findById(id)
    if (!usuario) throw new Error('Usuario no encontrado')
    const { password: _, ...usuarioSinPassword } = usuario
    return usuarioSinPassword
  },

  /** Actualiza datos editables del perfil (por ahora solo el nombre) */
  async actualizarPerfil(id: string, data: { fullName?: string }) {
    const usuario = await usuarioRepository.update(id, { fullName: data.fullName })
    const { password: _, ...usuarioSinPassword } = usuario
    return usuarioSinPassword
  },

  /** Cambia la contraseña verificando primero la actual */
  async cambiarPassword(id: string, actual: string, nueva: string) {
    const usuario = await usuarioRepository.findById(id)
    if (!usuario) throw new Error('Usuario no encontrado')
    const ok = await comparePassword(actual, usuario.password)
    if (!ok) throw new Error('La contraseña actual es incorrecta')
    await usuarioRepository.update(id, { password: await hashPassword(nueva) })
  },

  /** Actualiza la foto de perfil y borra el archivo anterior si lo había */
  async actualizarFoto(id: string, photoUrl: string) {
    const current = await usuarioRepository.findById(id)
    const usuario = await usuarioRepository.update(id, { photoUrl })
    const old = current?.photoUrl
    if (old && old.startsWith('/uploads/') && old !== photoUrl) {
      fs.unlink(path.join(__dirname, '../../public/uploads', path.basename(old)), () => {})
    }
    const { password: _, ...usuarioSinPassword } = usuario
    return usuarioSinPassword
  },

  /**
   * Elimina la cuenta. Bloquea si el usuario es owner de algún workspace
   * compartido (con otros miembros); los workspaces propios sin otros
   * miembros se borran junto con la cuenta.
   */
  async eliminarCuenta(id: string) {
    const owned = await prisma.workspaceMember.findMany({
      where: { userId: id, role: 'OWNER' },
      select: { workspaceId: true },
    })
    const ownedIds = owned.map((o) => o.workspaceId)
    if (ownedIds.length) {
      const others = await prisma.workspaceMember.count({
        where: { workspaceId: { in: ownedIds }, userId: { not: id } },
      })
      if (others > 0) {
        throw new Error('No podés eliminar tu cuenta mientras seas owner de un workspace compartido; transferí la propiedad o eliminá esos workspaces primero')
      }
      await prisma.workspace.deleteMany({ where: { id: { in: ownedIds } } })
    }
    await prisma.user.delete({ where: { id } })
  },
}
