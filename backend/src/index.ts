import 'dotenv/config'
import app from './app'
import prisma from './config/database'

const PORT = Number(process.env.PORT) || 3001

async function main() {
  try {
    await prisma.$connect()
    console.log('Conectado a la base de datos')
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API corriendo en puerto ${PORT}`)
    })
  } catch (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

main()
