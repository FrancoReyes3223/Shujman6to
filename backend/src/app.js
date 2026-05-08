// app.js
// Configura la aplicación Express (middlewares globales, rutas, manejador de errores).
// No arranca el servidor — eso lo hace server.js.
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

// Middlewares globales
app.use(helmet())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

// Rutas
app.use('/api', routes)

// Manejador de errores (SIEMPRE al final)
app.use(errorHandler)

export default app
