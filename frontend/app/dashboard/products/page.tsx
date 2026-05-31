"use client"

import React, { useState, useEffect } from 'react'
import { API_BASE } from '../../../lib/api'
import { useWorkspace } from '../../../components/WorkspaceProvider'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
}

export default function ProductsPage() {
  const { activeWorkspace } = useWorkspace()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')

  const getToken = () => {
    const value = `; ${document.cookie}`
    const parts = value.split('; token=')
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return localStorage.getItem('token') || ''
  }

  const fetchProducts = async () => {
    if (!activeWorkspace) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/workspaces/${activeWorkspace.id}/products`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [activeWorkspace])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkspace) return
    try {
      const res = await fetch(`${API_BASE}/workspaces/${activeWorkspace.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ name, price: Number(price), stock: Number(stock) })
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setName(''); setPrice(''); setStock('')
        fetchProducts()
      }
    } catch (e) { console.error(e) }
  }

  if (!activeWorkspace) return <p style={{ color: 'var(--text-muted)' }}>Selecciona una empresa</p>

  return (
    <div>
      <div className="table-container">
        <div className="table-header">
          <h2>Inventario de Productos</h2>
          {activeWorkspace.role !== 'USER' && (
            <button className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem', marginTop: 0 }} onClick={() => setShowModal(true)}>
              + Nuevo Producto
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>Cargando productos...</p>
        ) : products.length === 0 ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>No hay productos registrados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={p.stock > 0 ? 'badge badge-success' : 'badge badge-error'}>
                      {p.stock} en almacén
                    </span>
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
              <h2>Añadir Producto</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre</label>
                  <input className="form-input" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Laptop HP" />
                </div>
                <div className="form-group">
                  <label>Precio de venta</label>
                  <input className="form-input" type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Stock inicial</label>
                  <input className="form-input" type="number" required value={stock} onChange={e => setStock(e.target.value)} placeholder="0" />
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
