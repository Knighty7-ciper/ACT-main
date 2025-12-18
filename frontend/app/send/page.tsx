import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SendForm } from "@/components/send-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import StandardNav from "@/components/standard-nav"

export default async function SendPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single()

  if (!wallet) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={true} user={{ email: user.email!, isAdmin: profile?.role === "admin" }} />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/wallet">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Send ACT</h2>
            <p className="text-muted-foreground">Transfer ACT tokens to another wallet</p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <SendForm walletId={wallet.id} balance={wallet.balance} />
        </div>
      </main>
    </div>
  )
}
