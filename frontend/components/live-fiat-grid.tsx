"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ForexRateDisplay } from "@/components/forex-rate-display"

const SYMBOLS = ["NGN", "KES", "ZAR", "GHS", "EGP", "TZS", "UGX", "MAD", "ETB", "XOF"]
const FLAGS: Record<string, string> = { NGN: "🇳🇬", KES: "🇰🇪", ZAR: "🇿🇦", GHS: "🇬🇭", EGP: "🇪🇬", TZS: "🇹🇿", UGX: "🇺🇬", MAD: "🇲🇦", ETB: "🇪🇹", XOF: "🇸🇳" }
const NAMES: Record<string, string> = { NGN: "Nigerian Naira", KES: "Kenyan Shilling", ZAR: "South African Rand", GHS: "Ghanaian Cedi", EGP: "Egyptian Pound", TZS: "Tanzanian Shilling", UGX: "Ugandan Shilling", MAD: "Moroccan Dirham", ETB: "Ethiopian Birr", XOF: "West African CFA" }

export function LiveFiatGrid({ base = "USD" }: { base?: string }) {
  const [rates, setRates] = useState<Record<string, number>>({})
  const prev = useRef<Record<string, number>>({})

  const fetchRates = async () => {
    const params = new URLSearchParams({ base, symbols: SYMBOLS.join(",") })
    const res = await fetch(`/api/rates/fiat?${params.toString()}`, { cache: "no-store" })
    const json = await res.json()
    if (json && json.rates) setRates(json.rates as Record<string, number>)
  }

  useEffect(() => {
    fetchRates()
    const id = setInterval(fetchRates, 60000)
    return () => clearInterval(id)
  }, [base])

  const items = useMemo(() => SYMBOLS.map((code) => ({ code, rate: rates[code] })), [rates])

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(({ code, rate }, index) => {
        const last = prev.current[code]
        const change = last && rate ? ((rate - last) / last) * 100 : 0
        return (
          <ForexRateDisplay
            key={code}
            fromCurrency={base}
            toCurrency={code}
            rate={rate || 0}
            flag={FLAGS[code] || "🏳️"}
            change={isFinite(change) ? change : 0}
            style={{ animationDelay: `${index * 50}ms` }}
          />
        )
      })}
    </div>
  )
}

export default LiveFiatGrid
