"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, ArrowLeftRight, TrendingUp } from "lucide-react"

interface AdminDashboardProps {
  stats: {
    totalUsers: number
    totalWallets: number
    totalTransactions: number
    totalVolume: number
  }
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Wallets",
      value: stats.totalWallets.toLocaleString(),
      icon: Wallet,
      description: "Active wallets",
    },
    {
      title: "Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: ArrowLeftRight,
      description: "Total transactions",
    },
    {
      title: "Volume",
      value: `${stats.totalVolume.toLocaleString()} ACT`,
      icon: TrendingUp,
      description: "Total transaction volume",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
