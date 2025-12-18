import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Clock, Activity } from "lucide-react"
import Link from "next/link"
import StandardNav from "@/components/standard-nav"

export default function StatusPage() {
  const overallStatus = {
    status: "operational", // operational, maintenance, partial, major
    message: "All systems operational"
  }

  const services = [
    {
      name: "Web Application",
      status: "operational",
      uptime: "99.99%",
      lastIncident: "30 days ago"
    },
    {
      name: "Mobile App",
      status: "operational",
      uptime: "99.95%",
      lastIncident: "45 days ago"
    },
    {
      name: "API Services",
      status: "operational",
      uptime: "99.98%",
      lastIncident: "7 days ago"
    },
    {
      name: "Trading Engine",
      status: "operational",
      uptime: "100%",
      lastIncident: "None"
    },
    {
      name: "Wallet Services",
      status: "operational",
      uptime: "99.97%",
      lastIncident: "12 days ago"
    },
    {
      name: "Stellar Network",
      status: "operational",
      uptime: "99.99%",
      lastIncident: "15 days ago"
    }
  ]

  const recentIncidents = [
    {
      date: "2025-01-15",
      title: "Scheduled maintenance completed",
      severity: "maintenance",
      description: "Database optimization and security updates completed successfully.",
      duration: "2 hours"
    },
    {
      date: "2025-01-10",
      title: "Minor API latency",
      severity: "partial",
      description: "Increased response times for some API endpoints. Issue resolved automatically.",
      duration: "15 minutes"
    },
    {
      date: "2025-01-08",
      title: "Stellar network maintenance",
      severity: "maintenance",
      description: "Scheduled Stellar network maintenance affecting transaction processing.",
      duration: "1 hour"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "maintenance":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "partial":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "major":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-binance-light-gray" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "partial":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "major":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-binance-light-gray/20 text-binance-light-gray border-binance-light-gray/30"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "maintenance":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "partial":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "major":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

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
          <h1 className="text-4xl font-bold text-white mb-2">System Status</h1>
          <p className="text-xl text-binance-light-gray">Real-time status of all PESA-AFRIK services</p>
        </div>

        {/* Overall Status */}
        <div className="mb-12">
          <Card className="binance-card">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                {getStatusIcon(overallStatus.status)}
                <h2 className="text-2xl font-bold text-white ml-3">Platform Status</h2>
              </div>
              <Badge className={`${getStatusColor(overallStatus.status)} text-lg px-6 py-2`}>
                {overallStatus.message}
              </Badge>
              <p className="text-binance-light-gray mt-4">All systems are running normally</p>
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="binance-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{service.name}</h3>
                    {getStatusIcon(service.status)}
                  </div>
                  <Badge className={`${getStatusColor(service.status)} mb-3`}>
                    {service.status}
                  </Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-binance-light-gray">Uptime:</span>
                      <span className="text-white font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-binance-light-gray">Last incident:</span>
                      <span className="text-white font-medium">{service.lastIncident}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Response Time</h3>
                <div className="text-2xl font-bold text-binance-gold mb-2">145ms</div>
                <p className="text-binance-light-gray text-sm">Average API response</p>
              </CardContent>
            </Card>
            
            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Success Rate</h3>
                <div className="text-2xl font-bold text-green-400 mb-2">99.98%</div>
                <p className="text-binance-light-gray text-sm">Transaction success rate</p>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Active Users</h3>
                <div className="text-2xl font-bold text-binance-gold mb-2">12.5K</div>
                <p className="text-binance-light-gray text-sm">Users online now</p>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Volume</h3>
                <div className="text-2xl font-bold text-binance-gold mb-2">$2.8M</div>
                <p className="text-binance-light-gray text-sm">24h trading volume</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Incidents</h2>
          <Card className="binance-card">
            <CardContent className="p-0">
              <div className="space-y-0">
                {recentIncidents.map((incident, index) => (
                  <div key={index} className="border-b border-binance-dark-gray last:border-b-0">
                    <div className="p-6 hover:bg-binance-dark-gray/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <h3 className="text-lg font-bold text-white">{incident.title}</h3>
                        </div>
                        <span className="text-binance-light-gray text-sm">{incident.duration}</span>
                      </div>
                      <p className="text-binance-light-gray mb-2">{incident.description}</p>
                      <p className="text-binance-light-gray text-sm">{incident.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscribe to Updates */}
        <Card className="binance-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-binance-light-gray mb-6">
              Subscribe to receive notifications about system status updates and incidents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 p-3 bg-binance-dark-gray border border-binance-dark-gray rounded text-white placeholder-binance-light-gray"
              />
              <Button className="binance-button px-8">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
