"use client"

import { useEffect, useMemo, useRef, useState } from "react"

interface TickerItem {
  symbol: string
  price: number
}

const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "USDCUSDT", "MATICUSDT", "TRXUSDT"]

export function LiveCryptoTicker({ symbols = DEFAULT_SYMBOLS }: { symbols?: string[] }) {
  const [items, setItems] = useState<TickerItem[]>([])
  const prev = useRef<Map<string, number>>(new Map())

  const fetchData = async () => {
    const params = new URLSearchParams({ symbols: symbols.join(",") })
    const res = await fetch(`/api/rates/crypto?${params.toString()}`, { cache: "no-store" })
    const json = await res.json()
    const data: TickerItem[] = json.data.map((d: any) => ({ symbol: d.symbol, price: Number(d.price) }))
    setItems(data)
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 10000)
    return () => clearInterval(id)
  }, [])

  const doubled = useMemo(() => [...items, ...items], [items])

  const renderRow = (reverse = false) => (
    <div className="flex gap-12 whitespace-nowrap" style={{ animationDirection: reverse ? "reverse" as const : "normal" }}>
      {doubled.map((it, idx) => {
        const last = prev.current.get(it.symbol)
        const isUp = last !== undefined ? it.price >= last : true
        return (
          <div key={`${it.symbol}-${idx}`} className="flex items-center gap-4 px-6">
            <span className={`font-mono text-lg font-bold ${isUp ? "text-secondary" : "text-accent"}`}>{it.symbol.replace("USDT", "/USDT")}</span>
            <span className={`font-mono text-2xl font-bold text-primary`}>{it.price.toFixed(2)}</span>
          </div>
        )
      })}
    </div>
  )

  useEffect(() => {
    // store last seen prices
    const map = new Map(prev.current)
    for (const it of items) map.set(it.symbol, it.price)
    prev.current = map
  }, [items])

  if (!items.length) return <div className="h-16 bg-foreground" />

  return (
    <div className="relative overflow-hidden bg-foreground py-4">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-foreground to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-foreground to-transparent" />
      <div className="space-y-2">
        <div className="animate-ticker">{renderRow(false)}</div>
        <div className="animate-ticker">{renderRow(true)}</div>
      </div>
    </div>
  )
}

export default LiveCryptoTicker
