import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, TrendingUp, Clock, Eye, Star, Globe, BarChart3, Bell, ArrowRight, Loader2 } from "lucide-react"
import { newsService, type NewsArticle } from "@/lib/services/news.service"
import { useState, useEffect } from "react"

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadNewsData()
  }, [])

  const loadNewsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [newsData, featuredData] = await Promise.all([
        newsService.getNewsArticles(20),
        newsService.getFeaturedArticles(3)
      ])

      setNews(newsData)
      setFeaturedNews(featuredData)
    } catch (err) {
      setError('Failed to load news articles')
      console.error('Error loading news:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatViews = (views: number | undefined) => {
    if (!views) return '0'
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      announcement: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      market: 'bg-green-500/20 text-green-400 border-green-500/30',
      product: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      partnership: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      expansion: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      technical: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement':
        return <Bell className="h-4 w-4" />
      case 'market':
        return <TrendingUp className="h-4 w-4" />
      case 'product':
        return <BarChart3 className="h-4 w-4" />
      case 'partnership':
        return <Globe className="h-4 w-4" />
      case 'expansion':
        return <ArrowRight className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(article => article.category === selectedCategory)

  const categories = newsService.getNewsCategories()

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />
                  Markets
                </Button>
              </Link>
              <Link href="/trade">
                <Button variant="outline" className="text-binance-light-gray border-binance-dark-gray hover:bg-binance-dark-gray">
                  Trade
                </Button>
              </Link>
              <Link href="/news">
                <Button className="bg-binance-gold text-binance-black hover:bg-binance-gold/90">
                  News
                </Button>
              </Link>
            </div>
          </div>
      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Latest News</h1>
          <p className="text-xl text-binance-light-gray">Stay updated with the latest platform news and announcements</p>
        </div>

        {/* Featured News */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="binance-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-20 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredNews.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredNews.map((article) => (
                <Card key={article.id} className="binance-card hover:border-binance-gold/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {getCategoryIcon(article.category)}
                      <Badge className={getCategoryBadge(article.category)}>
                        {article.category}
                      </Badge>
                      {article.featured && (
                        <Badge variant="outline" className="border-binance-gold text-binance-gold">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-binance-light-gray mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-binance-light-gray">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(article.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {formatViews(article.view_count)}
                        </span>
                      </div>
                      <Link href={`/news/${article.id}`}>
                        <Button size="sm" className="bg-binance-gold text-binance-black hover:bg-binance-gold/90">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-binance-gold text-binance-black' : 'border-binance-dark-gray text-binance-light-gray hover:bg-binance-dark-gray'}
            >
              All News
            </Button>
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.value)}
                className={selectedCategory === category.value ? 'bg-binance-gold text-binance-black' : 'border-binance-dark-gray text-binance-light-gray hover:bg-binance-dark-gray'}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* News Articles */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="binance-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-600 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-600 rounded animate-pulse"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-32 bg-gray-600 rounded animate-pulse"></div>
                      <div className="h-8 w-24 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={loadNewsData} variant="outline" className="border-binance-gold text-binance-gold">
              Retry
            </Button>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-binance-light-gray mx-auto mb-4" />
            <p className="text-binance-light-gray text-lg">No news articles found</p>
            <p className="text-binance-light-gray text-sm mt-2">
              {selectedCategory === 'all' ? 'Check back later for updates' : 'No articles in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNews.map((article) => (
              <Card key={article.id} className="binance-card hover:border-binance-gold/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {getCategoryIcon(article.category)}
                        <Badge className={getCategoryBadge(article.category)}>
                          {article.category}
                        </Badge>
                        {article.featured && (
                          <Badge variant="outline" className="border-binance-gold text-binance-gold">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <Link href={`/news/${article.id}`}>
                        <h2 className="text-2xl font-bold text-white mb-3 hover:text-binance-gold transition-colors cursor-pointer">
                          {article.title}
                        </h2>
                      </Link>
                      <p className="text-binance-light-gray mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-binance-light-gray">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(article.published_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {formatViews(article.view_count)} views
                        </div>
                        {article.reading_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {article.reading_time} min read
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/news/${article.id}`}>
                      <Button className="bg-binance-gold text-binance-black hover:bg-binance-gold/90">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Newsletter Signup */}
        <Card className="binance-card mt-12">
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-binance-gold mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-binance-light-gray mb-6">
              Subscribe to our newsletter for the latest news and updates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 p-3 rounded-lg bg-binance-dark-gray border border-binance-dark-gray text-white placeholder-binance-light-gray"
              />
              <Button className="bg-binance-gold text-binance-black hover:bg-binance-gold/90">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}