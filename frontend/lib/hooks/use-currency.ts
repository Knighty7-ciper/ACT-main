"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface Currency {
  code: string
  name: string
  symbol: string
  is_active: boolean
}

export function useCurrency() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCurrencies = async () => {
      const { data, error } = await supabase.from("currencies").select("*").eq("is_active", true).order("code")

      if (!error && data) {
        setCurrencies(data)
      }
      setLoading(false)
    }

    fetchCurrencies()
  }, [])

  return { currencies, loading }
}
