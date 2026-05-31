"use client"

import React, { useState, useEffect } from 'react'
import { API_BASE } from '../../../lib/api'
import { useWorkspace } from '../../../components/WorkspaceProvider'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  description: string
  date: string
}

export default function TransactionsPage() {
  const { activeWorkspace } = useWorkspace()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const getToken = () => {
    const value = `; ${document.cookie}`
    const parts = value.split('; token=')
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return localStorage.getItem('token') || ''
  }

  const fetchTransactions = async () => {
    if (!activeWorkspace) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/workspaces/${activeWorkspace.id}/transactions`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) setTransactions(data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTransactions() }, [activeWorkspace])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkspace) return
    try {
      const res = await fetch(`${API_BASE}/workspaces/${activeWorkspace.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ type, amount: Number(amount), description })
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setAmount(''); setDescription('')
        fetchTransactions()
      }
    } catch (e) { console.error(e) }
  }

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)
  const balance = totalIncome - totalExpense

  if (!activeWorkspace) return <p style={{ color: 'var(--text-muted)' }}>Selecciona una empresa</p>

  return (
    <div>
      <div className="dashboard-header">
        <h1>Finanzas</h1>
        <p>Flujo de caja de {activeWorkspace.name}</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <div className="metric-card" style={{ borderLeft: `4px solid var(--accent)` }}>
          <h3>Balance Total</h3>
          <p className="value" style={{ color: balance >= 0 ? 'var(--success)' : 'var(--error)' }}>
            ${balance.toFixed(2)}
          </p>
        </div>
        <div className="metric-card" style={{ borderLeft: `4px solid var(--success)` }}>
          <h3>Total Ingresos</h3>
          <p className="value" style={{ color: 'var(--success)' }}>${totalIncome.toFixed(2)}</p>
        </div>
        <div className="metric-card" style={{ borderLeft: `4px solid var(--error)` }}>
          <h3>Total Gastos</h3>
          <p className="value" style={{ color: 'var(--error)' }}>${totalExpense.toFixed(2)}</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Movimientos</h2>
          {activeWorkspace.role !== 'USER' && (
            <button className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem', marginTop: 0 }} onClick={() => setShowModal(true)}>
              + Registrar Movimiento
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>Cargando movimientos...</p>
        ) : transactions.length === 0 ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>No hay movimientos registrados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.description}</td>
                  <td>
                    <span className={t.type === 'INCOME' ? 'badge badge-success' : 'badge badge-error'}>
                      {t.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'INCOME' ? 'var(--success)' : 'var(--error)' }}>
                    {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                  </td>
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
              <h2>Registrar Movimiento</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tipo</label>
                  <select className="form-input" value={type} onChange={e => setType(e.target.value as any)}>
                    <option value="INCOME">Ingreso</option>
                    <option value="EXPENSE">Gasto</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <input className="form-input" type="text" required value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. Venta del día" />
                </div>
                <div className="form-group">
                  <label>Monto</label>
                  <input className="form-input" type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
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
