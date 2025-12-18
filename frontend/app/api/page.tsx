import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, ArrowLeft, Book, Cpu, Key, Zap } from "lucide-react"
import Link from "next/link"
import StandardNav from "@/components/standard-nav"

export default function ApiPage() {
  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/auth/session",
      description: "Get current user session",
      auth: "Required"
    },
    {
      method: "POST",
      endpoint: "/api/auth/login",
      description: "Authenticate user",
      auth: "None"
    },
    {
      method: "POST",
      endpoint: "/api/wallet/balance",
      description: "Get wallet balance",
      auth: "Required"
    },
    {
      method: "POST",
      endpoint: "/api/transactions/create",
      description: "Create new transaction",
      auth: "Required"
    },
    {
      method: "GET",
      endpoint: "/api/rates/current",
      description: "Get current exchange rates",
      auth: "None"
    }
  ]

  const features = [
    {
      icon: Zap,
      title: "High Performance",
      description: "RESTful API with sub-100ms response times"
    },
    {
      icon: Key,
      title: "Secure Authentication",
      description: "JWT-based authentication with role-based access"
    },
    {
      icon: Cpu,
      title: "Real-time Data",
      description: "WebSocket connections for live price updates"
    },
    {
      icon: Book,
      title: "Comprehensive Docs",
      description: "Complete API documentation with examples"
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
          <h1 className="text-4xl font-bold text-white mb-2">API Documentation</h1>
          <p className="text-xl text-binance-light-gray">Integrate with PESA-AFRIK using our powerful API</p>
        </div>

        {/* API Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="binance-card hover:border-binance-gold/30 transition-colors">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-12 w-12 text-binance-gold mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-binance-light-gray text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
          <Card className="binance-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-binance-gold" />
                Authentication Example
              </CardTitle>
              <CardDescription className="text-binance-light-gray">
                Get your API key and start making requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-binance-light-gray mb-2">1. Get your API key from your account dashboard</p>
                  <div className="bg-binance-dark-gray/50 p-4 rounded-lg font-mono text-sm text-green-400">
                    API_KEY=pk_live_123456789abcdef
                  </div>
                </div>
                
                <div>
                  <p className="text-binance-light-gray mb-2">2. Make your first request</p>
                  <div className="bg-binance-dark-gray/50 p-4 rounded-lg font-mono text-sm text-green-400">
                    curl -H "Authorization: Bearer pk_live_123456789abcdef" \<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;https://api.pesa-afrik.com/api/wallet/balance
                  </div>
                </div>

                <div>
                  <p className="text-binance-light-gray mb-2">3. Response</p>
                  <div className="bg-binance-dark-gray/50 p-4 rounded-lg font-mono text-sm text-blue-400">
                    {"{"}<br />
                    &nbsp;&nbsp;"status": "success",<br />
                    &nbsp;&nbsp;"data": {"{"}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"balance": 1250.50,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"currency": "ACT"<br />
                    &nbsp;&nbsp;"}"}<br />
                    {"}"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Available Endpoints</h2>
          <Card className="binance-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-binance-dark-gray">
                      <th className="text-left p-4 text-binance-light-gray font-medium">Method</th>
                      <th className="text-left p-4 text-binance-light-gray font-medium">Endpoint</th>
                      <th className="text-left p-4 text-binance-light-gray font-medium">Description</th>
                      <th className="text-left p-4 text-binance-light-gray font-medium">Auth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiEndpoints.map((endpoint, index) => (
                      <tr key={index} className="border-b border-binance-dark-gray hover:bg-binance-dark-gray/30">
                        <td className="p-4">
                          <Badge 
                            variant="outline" 
                            className={
                              endpoint.method === "GET" ? "border-green-500 text-green-400" :
                              endpoint.method === "POST" ? "border-blue-500 text-blue-400" :
                              "border-orange-500 text-orange-400"
                            }
                          >
                            {endpoint.method}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono text-sm text-white">{endpoint.endpoint}</td>
                        <td className="p-4 text-binance-light-gray">{endpoint.description}</td>
                        <td className="p-4">
                          <Badge 
                            variant="outline" 
                            className={endpoint.auth === "Required" ? "border-red-500 text-red-400" : "border-gray-500 text-gray-400"}
                          >
                            {endpoint.auth}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rate Limits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Rate Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Public Endpoints</h3>
                <div className="text-2xl font-bold text-binance-gold mb-2">1000/hour</div>
                <p className="text-binance-light-gray">Rate limits for public APIs</p>
              </CardContent>
            </Card>
            
            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Authenticated</h3>
                <div className="text-2xl font-bold text-binance-gold mb-2">5000/hour</div>
                <p className="text-binance-light-gray">Higher limits for authenticated users</p>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
                <div className="text-2xl font-bold text-binance-gold mb-2">Unlimited</div>
                <p className="text-binance-light-gray">Enterprise and premium accounts</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* WebSocket API */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Real-time WebSocket API</h2>
          <Card className="binance-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-binance-light-gray mb-2">Connect to WebSocket for real-time price updates</p>
                  <div className="bg-binance-dark-gray/50 p-4 rounded-lg font-mono text-sm text-green-400">
                    wss://ws.pesa-afrik.com/v1/stream?api_key=pk_live_123456789abcdef
                  </div>
                </div>
                
                <div>
                  <p className="text-binance-light-gray mb-2">Subscribe to price updates</p>
                  <div className="bg-binance-dark-gray/50 p-4 rounded-lg font-mono text-sm text-green-400">
                    {"{"}<br />
                    &nbsp;&nbsp;"action": "subscribe",<br />
                    &nbsp;&nbsp;"channels": ["prices"]<br />
                    {"}"}
                  </div>
                </div>

                <div>
                  <p className="text-binance-light-gray mb-2">Receive real-time data</p>
                  <div className="bg-binance-dark-gray/50 p-4 rounded-lg font-mono text-sm text-blue-400">
                    {"{"}<br />
                    &nbsp;&nbsp;"channel": "prices",<br />
                    &nbsp;&nbsp;"data": {"{"}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"pair": "ACT/NGN",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"price": 124.56,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"timestamp": 1640995200<br />
                    &nbsp;&nbsp;"}"<br />
                    {"}"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SDKs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Official SDKs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">JS</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">JavaScript</h3>
                <p className="text-binance-light-gray text-sm">npm install @pesa-afrik/sdk</p>
              </CardContent>
            </Card>
            
            <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">PY</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Python</h3>
                <p className="text-binance-light-gray text-sm">pip install pesa-afrik-sdk</p>
              </CardContent>
            </Card>

            <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">RB</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ruby</h3>
                <p className="text-binance-light-gray text-sm">gem install pesa_afrik</p>
              </CardContent>
            </Card>

            <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">GO</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Go</h3>
                <p className="text-binance-light-gray text-sm">go get github.com/pesa-afrik/sdk-go</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support */}
        <Card className="binance-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-binance-light-gray mb-6">
              Our developer support team is here to help you integrate with PESA-AFRIK.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="binance-button text-lg px-8 py-3">
                  Contact Support
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black text-lg px-8 py-3">
                  View FAQ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
