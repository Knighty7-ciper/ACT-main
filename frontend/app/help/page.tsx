import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, MessageCircle, Mail, Phone, BookOpen, Video, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import StandardNav from "@/components/standard-nav"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const helpCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      description: "First steps with PESA-AFRIK",
      articles: 12
    },
    {
      title: "Account & Security",
      icon: FileText,
      description: "Manage your account and security",
      articles: 18
    },
    {
      title: "Trading",
      icon: Video,
      description: "Learn about trading and exchanges",
      articles: 25
    },
    {
      title: "Wallet & Payments",
      icon: Phone,
      description: "Wallet management and payments",
      articles: 20
    }
  ]

  const popularArticles = [
    {
      title: "How to create an account",
      category: "Getting Started",
      readTime: "3 min read",
      views: "15.2K"
    },
    {
      title: "Understanding ACT token",
      category: "Trading",
      readTime: "5 min read",
      views: "12.8K"
    },
    {
      title: "How to verify your account",
      category: "Account & Security",
      readTime: "4 min read",
      views: "9.5K"
    },
    {
      title: "Transferring funds securely",
      category: "Wallet & Payments",
      readTime: "6 min read",
      views: "8.7K"
    }
  ]

  const faqs = [
    {
      question: "What is PESA-AFRIK?",
      answer: "PESA-AFRIK is a pan-African currency exchange platform that enables seamless cross-border transactions using the ACT (African Currency Token) backed by gold, USD, and EUR reserves."
    },
    {
      question: "How do I get started?",
      answer: "Create an account, complete identity verification, deposit funds, and start trading ACT tokens with other supported currencies like NGN, KES, ZAR, and more."
    },
    {
      question: "What currencies are supported?",
      answer: "We support 13+ African currencies including NGN, KES, ZAR, GHS, and international currencies like USD and EUR. ACT serves as the base currency for all exchanges."
    },
    {
      question: "Is PESA-AFRIK secure?",
      answer: "Yes, we use bank-level security including SSL encryption, two-factor authentication, and secure cold storage for all assets. We also follow strict regulatory compliance."
    },
    {
      question: "What are the trading fees?",
      answer: "Trading fees start at 0.1% and decrease based on your trading volume. VIP tiers offer reduced fees and additional benefits."
    },
    {
      question: "How long do transactions take?",
      answer: "ACT transactions on Stellar blockchain typically settle within 3-5 seconds. Bank withdrawals may take 1-3 business days."
    }
  ]

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-binance-light-gray hover:text-binance-gold transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Help Center</h1>
          <p className="text-xl text-binance-light-gray">Find answers to your questions and get support</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-binance-light-gray" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray text-lg py-6"
              />
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-binance-gold mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
              <p className="text-binance-light-gray text-sm mb-4">Chat with our support team</p>
              <Button className="binance-button">Start Chat</Button>
            </CardContent>
          </Card>
          
          <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Email Support</h3>
              <p className="text-binance-light-gray text-sm mb-4">Send us a detailed message</p>
              <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">Email Us</Button>
            </CardContent>
          </Card>

          <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Phone Support</h3>
              <p className="text-binance-light-gray text-sm mb-4">Call our support line</p>
              <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white">Call Now</Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <category.icon className="h-12 w-12 text-binance-gold mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-binance-light-gray text-sm mb-3">{category.description}</p>
                  <Badge variant="secondary" className="bg-binance-gold/20 text-binance-gold">
                    {category.articles} articles
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="bg-binance-gold/20 text-binance-gold">
                      {article.category}
                    </Badge>
                    <span className="text-binance-light-gray text-sm">{article.views} views</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 hover:text-binance-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-binance-light-gray text-sm">{article.readTime}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <Card className="binance-card">
            <CardContent className="p-0">
              <div className="space-y-0">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-binance-dark-gray last:border-b-0">
                    <div className="p-6 hover:bg-binance-dark-gray/30 transition-colors">
                      <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                      <p className="text-binance-light-gray">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="binance-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
            <p className="text-binance-light-gray mb-6">
              Can't find what you're looking for? Our support team is ready to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="binance-button text-lg px-8 py-3">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black text-lg px-8 py-3">
                  View All FAQs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
