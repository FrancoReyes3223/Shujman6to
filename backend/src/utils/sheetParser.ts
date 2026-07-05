import * as XLSX from 'xlsx'

/** Normaliza una clave de header: minúsculas, sin acentos, sin espacios extremos. */
export function normalizeKey(s: string): string {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

/**
 * Parsea un buffer de CSV/Excel. Usa la primera hoja y la primera fila como
 * encabezados. Devuelve también los nombres de todas las hojas para poder
 * avisar si el archivo tiene más de una.
 */
export function parseSheet(buffer: Buffer): { rows: Record<string, unknown>[]; sheetNames: string[] } {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetNames = workbook.SheetNames
  const first = sheetNames[0]
  if (!first) return { rows: [], sheetNames }
  const sheet = workbook.Sheets[first]
  return { rows: XLSX.utils.sheet_to_json(sheet, { defval: '' }), sheetNames }
}

/**
 * Devuelve un getter sobre una fila que busca un valor probando varios
 * nombres de columna (en distintos idiomas), comparando claves normalizadas.
 */
export function rowGetter(row: Record<string, unknown>) {
  const normalized = new Map<string, unknown>()
  for (const [k, v] of Object.entries(row)) normalized.set(normalizeKey(k), v)
  return (...aliases: string[]): string => {
    for (const alias of aliases) {
      const v = normalized.get(normalizeKey(alias))
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
    }
    return ''
  }
}
