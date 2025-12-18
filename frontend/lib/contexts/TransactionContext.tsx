"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { createClient } from "@/lib/supabase/client"

interface Transaction {
  id: string
  from_wallet_id: string
  to_wallet_id: string
  amount: number
  transaction_type: string
  status: string
  stellar_transaction_hash?: string
  created_at: string
}

interface TransactionContextType {
  transactions: Transaction[]
  loading: boolean
  refreshTransactions: () => Promise<void>
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const refreshTransactions = async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data: wallets } = await supabase.from("wallets").select("id").eq("user_id", user.id)

    if (wallets && wallets.length > 0) {
      const walletIds = wallets.map((w) => w.id)
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or(`from_wallet_id.in.(${walletIds.join(",")}),to_wallet_id.in.(${walletIds.join(",")})`)
        .order("created_at", { ascending: false })
        .limit(50)

      if (!error && data) {
        setTransactions(data)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshTransactions()
  }, [user])

  return (
    <TransactionContext.Provider value={{ transactions, loading, refreshTransactions }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransaction() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransaction must be used within a TransactionProvider")
  }
  return context
}
