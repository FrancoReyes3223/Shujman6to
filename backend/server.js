// server.js
// Arranca el servidor HTTP y conecta a la base de datos.
// Se encarga solo de levantar el servicio.
import 'dotenv/config'
import app from './src/app.js'
import prisma from './src/config/database.js'

const PORT = process.env.PORT || 3001

async function main() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect()
    console.log('✅ Conectado a la base de datos')

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

main()
