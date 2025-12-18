import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, ArrowLeft, Share2, Eye, Clock, Loader2, AlertCircle } from "lucide-react"
import { notFound } from "next/navigation"
import { newsService, type NewsArticle } from "@/lib/services/news.service"

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const article = await newsService.getNewsArticle(params.id)

  if (!article) {
    notFound()
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
        return '🔔'
      case 'market':
        return '📈'
      case 'product':
        return '📊'
      case 'partnership':
        return '🤝'
      case 'expansion':
        return '🌍'
      default:
        return '📰'
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  // Split content into paragraphs
  const paragraphs = article.content.split('\n\n').filter(p => p.trim())

  return (
    <div className="min-h-screen bg-binance-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold text-white">PESA-AFRIK</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/markets">
                <Button variant="outline" className="text-binance-light-gray border-binance-dark-gray hover:bg-binance-dark-gray">
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
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Back Button */}
        <Link href="/news" className="inline-flex items-center text-binance-light-gray hover:text-binance-gold transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to News
        </Link>

        {/* Article Header */}
        <Card className="binance-card mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getCategoryIcon(article.category)}</span>
              <Badge className={getCategoryBadge(article.category)}>
                {article.category}
              </Badge>
              {article.featured && (
                <Badge variant="outline" className="border-binance-gold text-binance-gold">
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between text-binance-light-gray border-t border-b border-binance-dark-gray pt-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                {article.author && (
                  <div className="flex items-center gap-2">
                    <span>By {article.author.first_name} {article.author.last_name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{formatViews(article.view_count)} views</span>
                </div>
                {article.reading_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{article.reading_time} min read</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-binance-dark-gray text-binance-light-gray hover:bg-binance-dark-gray hover:text-binance-gold"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card className="binance-card">
          <CardContent className="p-8">
            <div className="prose prose-invert max-w-none">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-binance-light-gray leading-relaxed mb-6 text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-b border-binance-dark-gray">
                <h3 className="text-white font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-binance-dark-gray text-binance-light-gray hover:border-binance-gold hover:text-binance-gold"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Newsletter Signup */}
        <Card className="binance-card mt-8">
          <CardContent className="p-8 text-center">
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

        {/* Related Articles Placeholder */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
          <div className="text-center py-8">
            <p className="text-binance-light-gray">Related articles will appear here</p>
            <Link href="/news">
              <Button variant="outline" className="mt-4 border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                View All News
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}