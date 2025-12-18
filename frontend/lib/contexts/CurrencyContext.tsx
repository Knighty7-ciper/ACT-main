"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  country: string
  exchange_rate: number
  is_active: boolean
}

interface CurrencyContextType {
  currencies: Currency[]
  loading: boolean
  refreshCurrencies: () => Promise<void>
  getCurrencyByCode: (code: string) => Currency | undefined
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refreshCurrencies = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("currencies").select("*").eq("is_active", true).order("code")

    if (!error && data) {
      setCurrencies(data)
    }
    setLoading(false)
  }

  const getCurrencyByCode = (code: string) => {
    return currencies.find((c) => c.code === code)
  }

  useEffect(() => {
    refreshCurrencies()
  }, [])

  return (
    <CurrencyContext.Provider value={{ currencies, loading, refreshCurrencies, getCurrencyByCode }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
