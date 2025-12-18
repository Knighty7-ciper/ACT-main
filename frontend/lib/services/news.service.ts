/**
 * News Service
 * Handles news articles, announcements, and platform updates
 */
import { createClient } from "@/lib/supabase/client"

export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  category: 'announcement' | 'market' | 'product' | 'partnership' | 'expansion' | 'technical'
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  author_id: string
  published_at: string
  created_at: string
  updated_at: string
  meta_title?: string
  meta_description?: string
  tags?: string[]
  reading_time?: number
  view_count?: number
}

export interface NewsStats {
  total_articles: number
  published_articles: number
  total_views: number
  recent_articles: number
}

class NewsService {
  private supabase = createClient()

  /**
   * Get all published news articles
   */
  async getNewsArticles(limit: number = 20, offset: number = 0): Promise<NewsArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('news_articles')
        .select(`
          *,
          author:profiles!news_articles_author_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching news articles:', error)
      return []
    }
  }

  /**
   * Get a single news article by ID
   */
  async getNewsArticle(id: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await this.supabase
        .from('news_articles')
        .select(`
          *,
          author:profiles!news_articles_author_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single()

      if (error) throw error

      // Increment view count
      await this.supabase
        .from('news_articles')
        .update({ 
          view_count: (data.view_count || 0) + 1 
        })
        .eq('id', id)

      return data
    } catch (error) {
      console.error('Error fetching news article:', error)
      return null
    }
  }

  /**
   * Get featured news articles
   */
  async getFeaturedArticles(limit: number = 5): Promise<NewsArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('news_articles')
        .select(`
          *,
          author:profiles!news_articles_author_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching featured articles:', error)
      return []
    }
  }

  /**
   * Search news articles
   */
  async searchNewsArticles(query: string, category?: string): Promise<NewsArticle[]> {
    try {
      let queryBuilder = this.supabase
        .from('news_articles')
        .select(`
          *,
          author:profiles!news_articles_author_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false })

      if (category) {
        queryBuilder = queryBuilder.eq('category', category)
      }

      const { data, error } = await queryBuilder

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching news articles:', error)
      return []
    }
  }

  /**
   * Get news articles by category
   */
  async getNewsByCategory(category: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('news_articles')
        .select(`
          *,
          author:profiles!news_articles_author_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('status', 'published')
        .eq('category', category)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching news by category:', error)
      return []
    }
  }

  /**
   * Get news statistics
   */
  async getNewsStats(): Promise<NewsStats> {
    try {
      // Get total articles
      const { count: totalArticles } = await this.supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true })

      // Get published articles
      const { count: publishedArticles } = await this.supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      // Get total views
      const { data: viewData } = await this.supabase
        .from('news_articles')
        .select('view_count')

      const totalViews = viewData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0

      // Get recent articles (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: recentArticles } = await this.supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', weekAgo)

      return {
        total_articles: totalArticles || 0,
        published_articles: publishedArticles || 0,
        total_views: totalViews,
        recent_articles: recentArticles || 0
      }
    } catch (error) {
      console.error('Error fetching news stats:', error)
      return {
        total_articles: 0,
        published_articles: 0,
        total_views: 0,
        recent_articles: 0
      }
    }
  }

  /**
   * Create a new news article (admin only)
   */
  async createNewsArticle(article: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<NewsArticle | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      // Check if user is admin
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return null
      }

      const { data, error } = await this.supabase
        .from('news_articles')
        .insert({
          ...article,
          author_id: user.id,
          view_count: 0
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating news article:', error)
      return null
    }
  }

  /**
   * Get all news categories
   */
  getNewsCategories(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'announcement', label: 'Announcements', description: 'Platform updates and announcements' },
      { value: 'market', label: 'Market News', description: 'Market analysis and updates' },
      { value: 'product', label: 'Product Updates', description: 'New features and product releases' },
      { value: 'partnership', label: 'Partnerships', description: 'Partnership announcements' },
      { value: 'expansion', label: 'Expansion', description: 'Geographic expansion news' },
      { value: 'technical', label: 'Technical', description: 'Technical updates and improvements' }
    ]
  }

  /**
   * Calculate reading time for article content
   */
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }
}

export const newsService = new NewsService()
export default newsService