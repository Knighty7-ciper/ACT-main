import { NextResponse } from "next/server"

const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "USDCUSDT", "MATICUSDT", "TRXUSDT"]

export const revalidate = 15

async function fetchBinanceSymbols(symbols: string[]) {
  const symbolsParam = encodeURIComponent(JSON.stringify(symbols))
  const endpoints = [
    `https://api.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`,
    `https://data-api.binance.vision/api/v3/ticker/price?symbols=${symbolsParam}`,
  ]
  for (const url of endpoints) {
    const res = await fetch(url, { next: { revalidate } })
    if (res.ok) {
      const data = (await res.json()) as { symbol: string; price: string }[]
      return data
    }
  }
  throw new Error("Upstream error")
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get("symbols")
    const symbols = symbolsParam ? symbolsParam.split(",").map((s) => s.trim().toUpperCase()) : DEFAULT_SYMBOLS

    const data = await fetchBinanceSymbols(symbols)
    const filtered = data.filter((t) => symbols.includes(t.symbol))
    return NextResponse.json({ symbols, data: filtered })
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch crypto prices" }, { status: 502 })
  }
}
