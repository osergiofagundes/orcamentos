'use client'

import { useState, useEffect } from 'react'

interface DashboardInfo {
  currentTime: string
}

export function useDashboardInfo() {
  const [info, setInfo] = useState<DashboardInfo>({
    currentTime: ''
  })

  // Atualizar horário em tempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setInfo({ currentTime: timeString })
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return info
}