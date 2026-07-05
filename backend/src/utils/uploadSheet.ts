import multer from 'multer'
import path from 'path'

const ALLOWED_EXT = ['.csv', '.xlsx', '.xls']

/** Multer en memoria para recibir un archivo de planilla (CSV/Excel) en req.file.buffer */
export const uploadSheet = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_EXT.includes(ext)) cb(null, true)
    else cb(new Error('Formato no soportado. Subí un archivo .csv, .xlsx o .xls'))
  },
}).single('file')
