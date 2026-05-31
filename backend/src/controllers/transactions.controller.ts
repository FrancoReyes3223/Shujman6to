import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/workspaceAuth'

const prisma = new PrismaClient()

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params

    const transactions = await prisma.transaction.findMany({
      where: { workspaceId },
      orderBy: { date: 'desc' }
    })

    res.json({ success: true, data: transactions })
  } catch (error) {
    console.error('Error al obtener transacciones:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params
    const { type, amount, description, date } = req.body

    if (!type || !amount || !description) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' })
    }

    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({ success: false, message: 'El tipo debe ser INCOME o EXPENSE' })
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: Number(amount),
        description,
        date: date ? new Date(date) : new Date(),
        workspaceId
      }
    })

    res.status(201).json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error al crear transacción:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, id } = req.params

    const transaction = await prisma.transaction.findFirst({
      where: { id, workspaceId }
    })

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' })
    }

    await prisma.transaction.delete({
      where: { id }
    })

    res.json({ success: true, message: 'Transacción eliminada' })
  } catch (error) {
    console.error('Error al eliminar transacción:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}
