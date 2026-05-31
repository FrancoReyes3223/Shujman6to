import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/workspaceAuth'

const prisma = new PrismaClient()

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params

    const employees = await prisma.employee.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ success: true, data: employees })
  } catch (error) {
    console.error('Error al obtener empleados:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params
    const { fullName, position, salary, hireDate } = req.body

    if (!fullName) {
      return res.status(400).json({ success: false, message: 'El nombre completo es requerido' })
    }

    const employee = await prisma.employee.create({
      data: {
        fullName,
        position,
        salary: salary ? Number(salary) : null,
        hireDate: hireDate ? new Date(hireDate) : null,
        workspaceId
      }
    })

    res.status(201).json({ success: true, data: employee })
  } catch (error) {
    console.error('Error al crear empleado:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, id } = req.params

    const employee = await prisma.employee.findFirst({
      where: { id, workspaceId }
    })

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' })
    }

    await prisma.employee.delete({
      where: { id }
    })

    res.json({ success: true, message: 'Empleado eliminado' })
  } catch (error) {
    console.error('Error al eliminar empleado:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}
