"use client"

import { useEffect, useMemo, useRef, useState } from "react"

const SYMBOLS = ["NGN", "KES", "ZAR", "GHS", "EGP", "TZS", "UGX", "MAD", "ETB", "XOF"]
const FLAGS: Record<string, string> = { NGN: "🇳🇬", KES: "🇰🇪", ZAR: "🇿🇦", GHS: "🇬🇭", EGP: "🇪🇬", TZS: "🇹🇿", UGX: "🇺🇬", MAD: "🇲🇦", ETB: "🇪🇹", XOF: "🇸🇳" }

export default function LiveFiatMarquee({ base = "USD" }: { base?: string }) {
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

  const items = useMemo(() => SYMBOLS.map((code) => ({ code, rate: rates[code] || 0 })), [rates])
  const doubled = useMemo(() => [...items, ...items], [items])

  const Row = ({ reverse = false }: { reverse?: boolean }) => (
    <div className="flex gap-12 whitespace-nowrap animate-ticker" style={{ animationDirection: reverse ? "reverse" as const : "normal" }}>
      {doubled.map((it, idx) => {
        const last = prev.current[it.code]
        const up = last !== undefined ? it.rate >= last : true
        return (
          <div key={`${it.code}-${idx}`} className="flex items-center gap-4 px-6">
            <span className="text-3xl">{FLAGS[it.code] || "🏳️"}</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-background">{base}/{it.code}</span>
              <span className="font-mono text-2xl font-bold text-primary">{it.rate.toFixed(4)}</span>
              <span className={`text-sm font-semibold ${up ? "text-secondary" : "text-accent"}`}>{up ? "▲" : "▼"}</span>
            </div>
          </div>
        )
      })}
    </div>
  )

  useEffect(() => {
    const map = { ...prev.current }
    for (const it of items) map[it.code] = it.rate
    prev.current = map
  }, [items])

  if (!items.length) return <div className="h-16 bg-foreground" />

  return (
    <div className="relative overflow-hidden bg-foreground/10 py-4 rounded-xl border-2 border-border">
      <div className="space-y-2">
        <Row />
        <Row reverse />
      </div>
    </div>
  )
}
