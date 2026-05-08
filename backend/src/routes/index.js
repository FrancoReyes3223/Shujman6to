// routes/index.js
// Punto de entrada de todas las rutas. Incluye versionado y health check.
import { Router } from 'express'
import v1Routes from './v1/index.js'

const router = Router()

router.use('/v1', v1Routes)

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

export default router
