import { createClient } from "@/lib/supabase/server"
import { CurrencyCard } from "@/components/Currency/CurrencyCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import StandardNav from "@/components/standard-nav"

export default async function CurrencyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()
    profile = data
  }

  const { data: currencies } = await supabase.from("currencies").select("*").eq("is_active", true).order("code")

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav 
        isAuthenticated={!!user} 
        user={user ? { email: user.email!, isAdmin: profile?.role === "admin" } : undefined} 
      />}

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Currency Exchange Rates</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Live exchange rates for ACT token across African currencies
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Overview
            </CardTitle>
            <CardDescription>Real-time currency exchange rates updated every hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currencies?.map((currency) => (
                <CurrencyCard
                  key={currency.id}
                  code={currency.code}
                  name={currency.name}
                  symbol={currency.symbol}
                  rate={currency.exchange_rate}
                  flag={`/images/flags/${currency.country.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
