"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, AlertCircle } from "lucide-react"
import { sendAct } from "@/app/actions/transactions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface SendFormProps {
  walletId: string
  balance: number
}

export function SendForm({ walletId, balance }: SendFormProps) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = Number.parseFloat(amount)
    if (amountNum <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    if (amountNum > balance) {
      toast.error("Insufficient balance")
      return
    }

    setIsLoading(true)
    try {
      const result = await sendAct(recipient, amount, memo || undefined)

      if (result.success) {
        toast.success("Transaction sent successfully!")
        router.push("/transactions")
      } else {
        toast.error(result.error || "Failed to send transaction")
      }
    } catch (error) {
      toast.error("An error occurred while sending the transaction")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Transaction
        </CardTitle>
        <CardDescription>Transfer ACT tokens to another wallet address</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Available Balance: <strong>{balance.toFixed(2)} ACT</strong>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter Stellar public key (G...)"
              required
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">Enter the recipient's Stellar public key starting with 'G'</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ACT)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a note to this transaction"
              rows={3}
              maxLength={28}
            />
            <p className="text-xs text-muted-foreground">Maximum 28 characters</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
