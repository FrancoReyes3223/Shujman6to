"use client"

import React from 'react'
import { useWorkspace } from '../../components/WorkspaceProvider'

export default function DashboardPage() {
  const { activeWorkspace, isLoading } = useWorkspace()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <span className="spinner" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>Cargando...</p>
      </div>
    )
  }

  if (!activeWorkspace) {
    return (
      <div className="metric-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>¡Bienvenido!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Para empezar, necesitas seleccionar o crear una empresa.
        </p>
        <a href="/workspaces/create" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }}>
          + Crear Empresa
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Resumen — {activeWorkspace.name}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Tu rol: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{activeWorkspace.role}</span>
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Inventario</h3>
          <p className="value">Productos</p>
          <a href="/dashboard/products" style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '0.75rem', display: 'inline-block' }}>
            Ver inventario →
          </a>
        </div>

        <div className="metric-card">
          <h3>Finanzas</h3>
          <p className="value">Flujo de caja</p>
          <a href="/dashboard/transactions" style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '0.75rem', display: 'inline-block' }}>
            Ver movimientos →
          </a>
        </div>

        <div className="metric-card">
          <h3>Equipo</h3>
          <p className="value">Personal</p>
          <a href="/dashboard/employees" style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '0.75rem', display: 'inline-block' }}>
            Ver empleados →
          </a>
        </div>
      </div>
    </div>
  )
}
