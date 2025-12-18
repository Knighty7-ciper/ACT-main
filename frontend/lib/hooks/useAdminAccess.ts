'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAccess() {
  const [hasAdminAccess, setHasAdminAccess] = useState(false)
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const router = useRouter()

  // Check if user has admin access on component mount
  useEffect(() => {
    const adminAccess = localStorage.getItem('admin_access_granted')
    if (adminAccess === 'true') {
      setHasAdminAccess(true)
    }
  }, [])

  const grantAdminAccess = () => {
    localStorage.setItem('admin_access_granted', 'true')
    setHasAdminAccess(true)
    setIsAdminDialogOpen(false)
    router.push('/admin/dashboard')
  }

  const revokeAdminAccess = () => {
    localStorage.removeItem('admin_access_granted')
    setHasAdminAccess(false)
    router.push('/')
  }

  const openAdminDialog = () => {
    setIsAdminDialogOpen(true)
  }

  const closeAdminDialog = () => {
    setIsAdminDialogOpen(false)
  }

  return {
    hasAdminAccess,
    isAdminDialogOpen,
    grantAdminAccess,
    revokeAdminAccess,
    openAdminDialog,
    closeAdminDialog,
  }
}