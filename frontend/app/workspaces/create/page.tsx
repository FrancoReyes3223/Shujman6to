"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE } from '../../../lib/api'
import { useWorkspace } from '../../../components/WorkspaceProvider'

export default function CreateWorkspacePage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { refreshWorkspaces } = useWorkspace()

  const getToken = () => {
    const value = `; ${document.cookie}`
    const parts = value.split('; token=')
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return localStorage.getItem('token') || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (data.success) {
        await refreshWorkspaces()
        router.push('/dashboard')
      } else {
        setError(data.message || 'Error al crear la empresa')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Crear Empresa</h1>
        <p className="subtitle">Ingresa el nombre de tu empresa para comenzar</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="workspace-name">Nombre de la empresa</label>
            <div className="input-wrapper">
              <input
                id="workspace-name"
                type="text"
                className="form-input"
                placeholder="Ej. Mi Tienda S.A."
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Creando...</> : 'Crear Empresa'}
          </button>
        </form>

        <div className="auth-footer">
          <a href="/dashboard">← Volver al dashboard</a>
        </div>
      </div>
    </div>
  )
}
