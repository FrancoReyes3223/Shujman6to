import { PrismaClient, Employee } from '@prisma/client'
import { workspacesService } from './workspaces.service'
import { rowGetter, normalizeKey } from '../utils/sheetParser'

const prisma = new PrismaClient()

/** Mapea un status (en cualquier idioma) al valor canónico de la DB; default "Active". */
function normalizeEmployeeStatus(raw: string): string {
  const s = normalizeKey(raw)
  if (['active', 'activo', 'activa'].includes(s)) return 'Active'
  if (['on vacation', 'vacation', 'vacaciones', 'de vacaciones', 'licencia'].includes(s)) return 'On Vacation'
  if (['inactive', 'inactivo', 'inactiva', 'baja'].includes(s)) return 'Inactive'
  return 'Active'
}

export type ImportReport<T> = {
  inserted: number
  skipped: number
  duplicates: number
  errors: { row: number; message: string }[]
  warnings: string[]
  created: T[]
}

export const employeesService = {
  async list(userId: string, workspaceId: string) {
    await workspacesService.requireMember(userId, workspaceId)
    return prisma.employee.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    })
  },

  async create(userId: string, workspaceId: string, data: { name: string; role: string; department: string; status?: string }) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    return prisma.employee.create({
      data: { ...data, workspaceId },
    })
  },

  async update(userId: string, workspaceId: string, employeeId: string, data: { name?: string; role?: string; department?: string; status?: string }) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    await this.findOrFail(workspaceId, employeeId)
    return prisma.employee.update({
      where: { id: employeeId },
      data,
    })
  },

  async remove(userId: string, workspaceId: string, employeeId: string) {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)
    await this.findOrFail(workspaceId, employeeId)
    return prisma.employee.delete({ where: { id: employeeId } })
  },

  async findOrFail(workspaceId: string, employeeId: string) {
    const emp = await prisma.employee.findFirst({ where: { id: employeeId, workspaceId } })
    if (!emp) throw new Error('Empleado no encontrado')
    return emp
  },

  /** Importa filas (de un CSV/Excel ya parseado) en modo append, salteando inválidas y duplicadas. */
  async importRows(userId: string, workspaceId: string, rawRows: Record<string, unknown>[]): Promise<ImportReport<Employee>> {
    await workspacesService.requireAtLeastAdmin(userId, workspaceId)

    const candidates: { row: number; data: { name: string; role: string; department: string; status: string } }[] = []
    const errors: { row: number; message: string }[] = []

    rawRows.forEach((raw, i) => {
      const rowNum = i + 2 // +1 por header, +1 para que sea 1-based como en la planilla
      const get = rowGetter(raw)
      const name = get('name', 'nombre')
      const role = get('role', 'rol', 'cargo', 'puesto')
      const department = get('department', 'departamento', 'area', 'depto', 'sector')
      const status = get('status', 'estado')

      if (!name && !role && !department && !status) return // fila vacía: ignorar sin contar

      const missing: string[] = []
      if (!name) missing.push('name')
      if (!role) missing.push('role')
      if (!department) missing.push('department')
      if (missing.length) {
        errors.push({ row: rowNum, message: `Faltan campos obligatorios: ${missing.join(', ')}` })
        return
      }

      candidates.push({ row: rowNum, data: { name, role, department, status: normalizeEmployeeStatus(status) } })
    })

    // Deduplicación por nombre (contra la DB y dentro del archivo)
    const existing = await prisma.employee.findMany({ where: { workspaceId }, select: { name: true } })
    const seen = new Set(existing.map((e) => normalizeKey(e.name)))
    let duplicates = 0
    const toInsert: { name: string; role: string; department: string; status: string }[] = []
    for (const c of candidates) {
      const key = normalizeKey(c.data.name)
      if (seen.has(key)) {
        duplicates++
        errors.push({ row: c.row, message: `Duplicado: ya existe un empleado "${c.data.name}"` })
        continue
      }
      seen.add(key)
      toInsert.push(c.data)
    }

    const created = toInsert.length
      ? await prisma.$transaction(toInsert.map((d) => prisma.employee.create({ data: { ...d, workspaceId } })))
      : []

    return { inserted: created.length, skipped: errors.length, duplicates, errors, warnings: [], created }
  },
}
