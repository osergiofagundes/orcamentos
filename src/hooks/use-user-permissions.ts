"use client"

import { useState, useEffect } from "react"

interface UserPermissions {
  canManageCategories: boolean
  canManageProducts: boolean
  canManageClients: boolean
  canManageUsers: boolean
  canManageWorkspace: boolean
  userLevel: number
  isLoading: boolean
}

export function useUserPermissions(workspaceId: string): UserPermissions {
  const [permissions, setPermissions] = useState<UserPermissions>({
    canManageCategories: false,
    canManageProducts: false,
    canManageClients: false,
    canManageUsers: false,
    canManageWorkspace: false,
    userLevel: 1,
    isLoading: true,
  })

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}/user-permissions`)
        if (response.ok) {
          const data = await response.json()
          const level = data.nivel_permissao || 1

          setPermissions({
            canManageCategories: level >= 2, // Nível 2+ pode gerenciar categorias
            canManageProducts: level >= 2,   // Nível 2+ pode gerenciar produtos
            canManageClients: level >= 2,    // Nível 2+ pode gerenciar clientes
            canManageUsers: level >= 2,      // Nível 2+ pode gerenciar usuários
            canManageWorkspace: level >= 3,  // Nível 3 pode gerenciar workspace
            userLevel: level,
            isLoading: false,
          })
        } else {
          // Se falhar, assume permissões básicas
          setPermissions({
            canManageCategories: false,
            canManageProducts: false,
            canManageClients: false,
            canManageUsers: false,
            canManageWorkspace: false,
            userLevel: 1,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error("Erro ao buscar permissões do usuário:", error)
        setPermissions(prev => ({ ...prev, isLoading: false }))
      }
    }

    if (workspaceId) {
      fetchUserPermissions()
    }
  }, [workspaceId])

  return permissions
}
