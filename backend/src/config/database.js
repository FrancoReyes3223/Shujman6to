// config/database.js
// Centraliza la conexión a la base de datos.
// Si necesitas modificar la conexión, solo cambias este archivo.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
