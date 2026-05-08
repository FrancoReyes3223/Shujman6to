// middlewares/errorHandler.js
// Manejador de errores centralizado. SIEMPRE va al final de la cadena.
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message)

  // Errores conocidos
  if (err.message === 'Credenciales incorrectas') {
    return res.status(401).json({
      success: false,
      message: err.message
    })
  }

  if (err.message === 'El email ya está registrado') {
    return res.status(409).json({
      success: false,
      message: err.message
    })
  }

  if (err.message === 'Usuario no encontrado') {
    return res.status(404).json({
      success: false,
      message: err.message
    })
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  })
}
