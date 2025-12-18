import { createClient } from "@/lib/supabase/client"

export const newsService = {
  async getAllNews() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
    return { data, error }
  },

  async getNewsById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("news_articles").select("*").eq("id", id).single()
    return { data, error }
  },

  async createNews(article: any) {
    const supabase = createClient()
    const { data, error } = await supabase.from("news_articles").insert(article).select().single()
    return { data, error }
  },

  async updateNews(id: string, updates: any) {
    const supabase = createClient()
    const { data, error } = await supabase.from("news_articles").update(updates).eq("id", id).select().single()
    return { data, error }
  },

  async deleteNews(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("news_articles").delete().eq("id", id)
    return { error }
  },
}
