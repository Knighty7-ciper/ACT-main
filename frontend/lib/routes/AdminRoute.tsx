"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { LoadingSpinner } from "@/components/UI/LoadingSpinner"
import { createClient } from "@/lib/supabase/client"

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading && !user) {
        router.push("/auth/login")
        return
      }

      if (user) {
        const supabase = createClient()
        const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

        if (profile?.role === "admin" || profile?.role === "super_admin") {
          setIsAdmin(true)
        } else {
          router.push("/dashboard")
        }
      }
      setLoading(false)
    }

    checkAdmin()
  }, [user, authLoading, router])

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Verifying access..." />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return <>{children}</>
}
