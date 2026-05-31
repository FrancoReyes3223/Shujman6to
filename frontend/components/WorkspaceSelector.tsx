"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useWorkspace } from './WorkspaceProvider'

export default function WorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace, isLoading } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar el dropdown si el usuario hace clic afuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (isLoading) return <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cargando...</p>
  if (workspaces.length === 0) return (
    <a href="/workspaces/create" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
      + Crear empresa
    </a>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.6rem 0.75rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeWorkspace?.name || 'Seleccionar empresa'}
        </span>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 50,
          overflow: 'hidden',
        }}>
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => { setActiveWorkspace(ws); setIsOpen(false) }}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.65rem 0.85rem',
                textAlign: 'left',
                background: activeWorkspace?.id === ws.id ? 'var(--accent-glow)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-color)',
                color: activeWorkspace?.id === ws.id ? 'var(--accent)' : 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontWeight: 600 }}>{ws.name}</span>
              <br />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rol: {ws.role}</span>
            </button>
          ))}
          <a
            href="/workspaces/create"
            style={{
              display: 'block',
              padding: '0.65rem 0.85rem',
              color: 'var(--accent)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            + Nueva empresa
          </a>
        </div>
      )}
    </div>
  )
}
