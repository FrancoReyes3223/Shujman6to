import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/workspaceAuth'

const prisma = new PrismaClient()

export const createWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body
    const userId = req.user?.id

    if (!name) {
      return res.status(400).json({ success: false, message: 'El nombre del workspace es requerido' })
    }

    // Crear el workspace y asignar al creador como OWNER automáticamente
    const workspace = await prisma.workspace.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      }
    })

    res.status(201).json({ success: true, data: workspace })
  } catch (error) {
    console.error('Error al crear workspace:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const getWorkspaces = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    // Obtener todos los workspaces donde este usuario es miembro
    const userWorkspaces = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true
      }
    })

    // Mapear la respuesta para que sea más limpia
    const workspaces = userWorkspaces.map(mw => ({
      id: mw.workspace.id,
      name: mw.workspace.name,
      role: mw.role,
      joinedAt: mw.createdAt
    }))

    res.json({ success: true, data: workspaces })
  } catch (error) {
    console.error('Error al obtener workspaces:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const inviteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = req.body
    // El workspaceId viene de la URL (ruta dinámica)
    const { workspaceId } = req.params

    if (!email) {
      return res.status(400).json({ success: false, message: 'El email del usuario a invitar es requerido' })
    }

    // Solo se permite invitar como ADMIN o USER, no OWNER
    const assignRole = role === 'ADMIN' ? 'ADMIN' : 'USER'

    // Buscar al usuario por email
    const userToInvite = await prisma.user.findUnique({
      where: { email }
    })

    if (!userToInvite) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    // Comprobar si ya es miembro
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userToInvite.id,
          workspaceId: workspaceId
        }
      }
    })

    if (existingMember) {
      return res.status(400).json({ success: false, message: 'El usuario ya pertenece a este workspace' })
    }

    // Agregar al usuario al workspace
    const newMember = await prisma.workspaceMember.create({
      data: {
        userId: userToInvite.id,
        workspaceId,
        role: assignRole
      }
    })

    res.status(201).json({ success: true, message: 'Usuario invitado correctamente', data: newMember })
  } catch (error) {
    console.error('Error al invitar usuario:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}
