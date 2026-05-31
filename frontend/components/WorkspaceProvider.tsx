"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { API_BASE } from '../lib/api'

export interface Workspace {
  id: string
  name: string
  role: string
  joinedAt: string
}

interface WorkspaceContextType {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  setActiveWorkspace: (workspace: Workspace) => void
  isLoading: boolean
  refreshWorkspaces: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getToken = () => {
    if (typeof document === 'undefined') return ''
    const value = `; ${document.cookie}`
    const parts = value.split('; token=')
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return ''
  }

  const fetchWorkspaces = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_BASE}/workspaces`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      if (data.success && data.data) {
        setWorkspaces(data.data)
        
        if (data.data.length > 0) {
          const currentActive = localStorage.getItem('activeWorkspaceId')
          const found = data.data.find((w: Workspace) => w.id === currentActive)
          
          if (found) {
            setActiveWorkspace(found)
          } else {
            setActiveWorkspace(data.data[0])
            localStorage.setItem('activeWorkspaceId', data.data[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error cargando workspaces:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  // Cuando el usuario cambia manualmente el workspace activo
  const handleSetActive = (workspace: Workspace) => {
    setActiveWorkspace(workspace)
    localStorage.setItem('activeWorkspaceId', workspace.id)
  }

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspaces, 
        activeWorkspace, 
        setActiveWorkspace: handleSetActive, 
        isLoading, 
        refreshWorkspaces: fetchWorkspaces 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace debe ser usado dentro de un WorkspaceProvider')
  }
  return context
}
