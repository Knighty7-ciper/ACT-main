"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface WalletBalanceProps {
  balance: number
  currency: string
  label?: string
}

export function WalletBalance({ balance, currency, label = "Available Balance" }: WalletBalanceProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {balance.toFixed(2)} {currency}
        </div>
      </CardContent>
    </Card>
  )
}
