"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface CurrencyCardProps {
  code: string
  name: string
  symbol: string
  rate: number
  change24h?: number
  flag?: string
}

export function CurrencyCard({ code, name, symbol, rate, change24h, flag }: CurrencyCardProps) {
  const isPositive = change24h && change24h > 0

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{code}</CardTitle>
        {flag && <img src={flag || "/placeholder.svg"} alt={name} className="h-6 w-8 object-cover rounded" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{name}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">
              {symbol}
              {rate.toFixed(4)}
            </p>
          </div>
          {change24h !== undefined && (
            <Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change24h).toFixed(2)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
