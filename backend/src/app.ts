import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import routes from './routes/index'
import { errorHandler } from './middlewares/errorHandler'

const app = express()

app.use(helmet())
app.use(cors({
  origin: [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/200\.3\.127\.46(:\d+)?$/],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.use('/', routes)

app.use(errorHandler)

export default app
