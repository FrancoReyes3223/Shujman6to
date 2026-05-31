"use client"

import React, { useState, useEffect } from 'react'
import { API_BASE } from '../../../lib/api'
import { useWorkspace } from '../../../components/WorkspaceProvider'

interface Employee {
  id: string
  fullName: string
  position: string
  salary: number
}

export default function EmployeesPage() {
  const { activeWorkspace } = useWorkspace()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [position, setPosition] = useState('')
  const [salary, setSalary] = useState('')

  const getToken = () => {
    const value = `; ${document.cookie}`
    const parts = value.split('; token=')
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return localStorage.getItem('token') || ''
  }

  const fetchEmployees = async () => {
    if (!activeWorkspace) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/workspaces/${activeWorkspace.id}/employees`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) setEmployees(data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEmployees() }, [activeWorkspace])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkspace) return
    try {
      const res = await fetch(`${API_BASE}/workspaces/${activeWorkspace.id}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ fullName, position, salary: salary ? Number(salary) : null })
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setFullName(''); setPosition(''); setSalary('')
        fetchEmployees()
      }
    } catch (e) { console.error(e) }
  }

  if (!activeWorkspace) return <p style={{ color: 'var(--text-muted)' }}>Selecciona una empresa</p>

  return (
    <div>
      <div className="table-container">
        <div className="table-header">
          <h2>Equipo y Personal</h2>
          {activeWorkspace.role !== 'USER' && (
            <button className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem', marginTop: 0 }} onClick={() => setShowModal(true)}>
              + Registrar Empleado
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>Cargando personal...</p>
        ) : employees.length === 0 ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>No hay empleados registrados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Puesto</th>
                <th>Salario</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--accent-glow)', color: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
                    }}>
                      {emp.fullName.charAt(0).toUpperCase()}
                    </div>
                    {emp.fullName}
                  </td>
                  <td>{emp.position || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{emp.salary ? `$${emp.salary.toFixed(2)}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Empleado</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input className="form-input" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ej. Juan García" />
                </div>
                <div className="form-group">
                  <label>Puesto</label>
                  <input className="form-input" type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="Ej. Cajero" />
                </div>
                <div className="form-group">
                  <label>Salario Mensual</label>
                  <input className="form-input" type="number" step="0.01" value={salary} onChange={e => setSalary(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-logout" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.7rem 2rem', marginTop: 0 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
