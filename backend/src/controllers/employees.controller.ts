import { Request, Response, NextFunction } from 'express'
import { employeesService } from '../services/employees.service'
import { parseSheet } from '../utils/sheetParser'

type AuthRequest = Request & { user: { id: string; email: string } }

export const employeesController = {
  async importFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' })
      const { rows, sheetNames } = parseSheet(req.file.buffer)
      const report = await employeesService.importRows(userId, workspaceId, rows)
      if (sheetNames.length > 1) {
        report.warnings.push(`El archivo tiene ${sheetNames.length} hojas; solo se importó la primera ("${sheetNames[0]}").`)
      }
      res.json({ success: true, data: report })
    } catch (error) {
      next(error)
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      const employees = await employeesService.list(userId, workspaceId)
      res.json({ success: true, data: employees })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId } = req.params
      const { name, role, department, status } = req.body
      if (!name?.trim()) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
      if (!role?.trim()) return res.status(400).json({ success: false, message: 'El rol es obligatorio' })
      if (!department?.trim()) return res.status(400).json({ success: false, message: 'El departamento es obligatorio' })
      const employee = await employeesService.create(userId, workspaceId, { name: name.trim(), role: role.trim(), department: department.trim(), status })
      res.status(201).json({ success: true, data: employee })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId, employeeId } = req.params
      const { name, role, department, status } = req.body
      const employee = await employeesService.update(userId, workspaceId, employeeId, { name, role, department, status })
      res.json({ success: true, data: employee })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = (req as AuthRequest).user
      const { workspaceId, employeeId } = req.params
      await employeesService.remove(userId, workspaceId, employeeId)
      res.json({ success: true, message: 'Empleado eliminado' })
    } catch (error) {
      next(error)
    }
  },
}
