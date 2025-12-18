"use client"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionItemProps {
  type: "sent" | "received"
  amount: number
  currency: string
  address: string
  date: string
  status: "pending" | "completed" | "failed"
}

export function TransactionItem({ type, amount, currency, address, date, status }: TransactionItemProps) {
  const isReceived = type === "received"

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isReceived ? "bg-green-100 dark:bg-green-900/20" : "bg-muted",
          )}
        >
          {isReceived ? (
            <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium">{isReceived ? "Received" : "Sent"}</p>
          <p className="text-sm text-muted-foreground font-mono">{address}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-semibold", isReceived && "text-green-600 dark:text-green-400")}>
          {isReceived ? "+" : "-"}
          {amount} {currency}
        </p>
        <Badge variant={status === "completed" ? "default" : status === "pending" ? "secondary" : "destructive"}>
          {status}
        </Badge>
      </div>
    </div>
  )
}
