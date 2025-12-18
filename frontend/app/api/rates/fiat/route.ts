import { NextResponse } from "next/server"

const DEFAULT_BASE = "USD"
const DEFAULT_SYMBOLS = [
  "NGN",
  "KES",
  "ZAR",
  "GHS",
  "EGP",
  "TZS",
  "UGX",
  "MAD",
  "ETB",
  "XOF",
]

export const revalidate = 60

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const base = (searchParams.get("base") || DEFAULT_BASE).toUpperCase()
    const symbolsParam = searchParams.get("symbols")
    const symbols = (symbolsParam ? symbolsParam.split(",") : DEFAULT_SYMBOLS).map((s) => s.trim().toUpperCase())
    const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols.join(","))}`

    const res = await fetch(url, { next: { revalidate } })
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 })
    }
    const data = await res.json()
    return NextResponse.json({ base, date: data.date, rates: data.rates })
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 })
  }
}
