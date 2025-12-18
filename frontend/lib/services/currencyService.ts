import { createClient } from "@/lib/supabase/client"

export const currencyService = {
  async getAllCurrencies() {
    const supabase = createClient()
    const { data, error } = await supabase.from("currencies").select("*").eq("is_active", true).order("code")
    return { data, error }
  },

  async getCurrencyByCode(code: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("currencies").select("*").eq("code", code).single()
    return { data, error }
  },

  async updateExchangeRate(currencyId: string, rate: number) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("currencies")
      .update({ exchange_rate: rate, updated_at: new Date().toISOString() })
      .eq("id", currencyId)
      .select()
      .single()
    return { data, error }
  },
}
