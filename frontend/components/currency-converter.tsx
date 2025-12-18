"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Calculator, TrendingUp } from "lucide-react"
import { pppACTPriceService, CurrencyConversion } from "@/lib/services/ppp-act-price-service"
import { toast } from "sonner"

interface Currency {
  code: string
  name: string
  symbol: string
}

interface CurrencyConverterProps {
  currencies?: Currency[] // Make optional for backward compatibility
  className?: string
}

const SUPPORTED_CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'ACT', name: 'ACT Token', symbol: 'ACT' },
]

export function CurrencyConverter({ currencies, className }: CurrencyConverterProps) {
  const [fromCurrency, setFromCurrency] = useState("ACT")
  const [toCurrency, setToCurrency] = useState("NGN")
  const [amount, setAmount] = useState("100")
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastConversion, setLastConversion] = useState<CurrencyConversion | null>(null)

  // Use provided currencies or fallback to supported ones
  const displayCurrencies = currencies || SUPPORTED_CURRENCIES

  const handleConvert = async () => {
    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setConvertedAmount(null)
      setRate(null)
      return
    }

    setLoading(true)
    try {
      let conversion: CurrencyConversion | null = null

      if (fromCurrency === 'ACT' && toCurrency !== 'ACT') {
        // Convert ACT to other currency
        conversion = await pppACTPriceService.convertFromACT(amountNum, toCurrency)
      } else if (fromCurrency !== 'ACT' && toCurrency === 'ACT') {
        // Convert other currency to ACT
        conversion = await pppACTPriceService.convertToACT(amountNum, fromCurrency)
      } else if (fromCurrency === 'ACT' && toCurrency === 'ACT') {
        // Same currency
        conversion = {
          amount: amountNum,
          fromCurrency: 'ACT',
          toCurrency: 'ACT',
          convertedAmount: amountNum,
          exchangeRate: 1,
          timestamp: new Date().toISOString()
        }
      } else {
        // Other currency to other currency - use ACT as bridge
        const toAct = await pppACTPriceService.convertToACT(amountNum, fromCurrency)
        if (toAct) {
          conversion = await pppACTPriceService.convertFromACT(toAct.convertedAmount, toCurrency)
        }
      }

      if (conversion) {
        setConvertedAmount(conversion.convertedAmount)
        setRate(conversion.exchangeRate)
        setLastConversion(conversion)
      } else {
        throw new Error('Conversion failed')
      }
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error('Failed to convert currency')
      setConvertedAmount(null)
      setRate(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setAmount(convertedAmount?.toString() || "100")
    setConvertedAmount(null)
    setRate(null)
    setLastConversion(null)
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value && !isNaN(Number(value)) && Number(value) > 0) {
      // Auto-convert when user types
      handleConvert()
    }
  }

  return (
    <Card className={`border-2 border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          PPP Currency Converter
        </CardTitle>
        <CardDescription>
          Convert currencies using real-time PPP (Purchasing Power Parity) rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from-amount">From</Label>
            <div className="flex gap-2">
              <Input
                id="from-amount"
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 border-2"
              />
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-32 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {displayCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" size="icon" onClick={handleSwap} className="rounded-full border-2">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-amount">To</Label>
            <div className="flex gap-2">
              <Input
                id="to-amount"
                type="number"
                value={convertedAmount?.toFixed(8) || "0.00000000"}
                readOnly
                className="flex-1 border-2 bg-muted/50"
              />
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-32 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {displayCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {rate && lastConversion && (
          <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">PPP Conversion Result:</span>
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Real-time PPP Rate</span>
                </div>
              </div>
              <div className="text-lg font-bold">
                {Number(lastConversion.amount).toFixed(8)} {lastConversion.fromCurrency} = {Number(lastConversion.convertedAmount).toFixed(8)} {lastConversion.toCurrency}
              </div>
              <div className="text-sm text-muted-foreground">
                Exchange Rate: 1 {toCurrency} = {rate.toFixed(8)} {fromCurrency}
              </div>
              <div className="text-xs text-muted-foreground">
                Updated: {new Date(lastConversion.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleConvert} 
          disabled={loading || !amount || isNaN(Number(amount)) || Number(amount) <= 0} 
          className="w-full font-semibold"
          size="lg"
        >
          {loading ? 'Converting...' : 'Convert with PPP Rate'}
        </Button>

        {/* PPP Methodology Info */}
        <div className="rounded-lg border-2 border-border/50 bg-muted/20 p-4">
          <div className="text-sm">
            <p className="font-semibold mb-2">PPP-Based Conversion</p>
            <p className="text-muted-foreground text-xs">
              Our currency converter uses Purchasing Power Parity methodology based on 44+ products 
              across 20+ African countries. This provides more accurate real-world value comparisons 
              than traditional forex rates.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
