"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { createClient } from "@/lib/supabase/client"

interface Wallet {
  id: string
  user_id: string
  stellar_public_key: string
  balance: number
  currency_code: string
  created_at: string
}

interface WalletContextType {
  wallets: Wallet[]
  loading: boolean
  refreshWallets: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const refreshWallets = async () => {
    if (!user) {
      setWallets([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase.from("wallets").select("*").eq("user_id", user.id)

    if (!error && data) {
      setWallets(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshWallets()
  }, [user])

  return <WalletContext.Provider value={{ wallets, loading, refreshWallets }}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
