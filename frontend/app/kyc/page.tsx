import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { KYCStatusCard } from "@/components/kyc-status-card"
import { KYCUploadForm } from "@/components/kyc-upload-form"
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Upload,
  Eye,
  Download,
  Star,
  Lock,
  UserCheck,
  Globe
} from "lucide-react"
import { getKYCDocuments } from "@/app/actions/kyc"
import StandardNav from "@/components/standard-nav"
import Link from "next/link"

export default async function KYCPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile with KYC status
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  // Get uploaded documents
  const documentsResult = await getKYCDocuments()
  const documents = documentsResult.data || []

  // Mock KYC data for Binance-style layout
  const kycStatus = {
    level: 'Basic',
    status: 'pending',
    progress: 60,
    documentsUploaded: 2,
    maxDocuments: 5,
    verificationTime: '24-48 hours'
  }

  const requirements = [
    { name: 'Government ID', status: 'uploaded', description: 'Passport or National ID' },
    { name: 'Proof of Address', status: 'uploaded', description: 'Utility bill or bank statement' },
    { name: 'Selfie Photo', status: 'required', description: 'Clear photo of yourself' },
    { name: 'Source of Funds', status: 'pending', description: 'Bank statements or income proof' },
    { name: 'Additional Documents', status: 'optional', description: 'Any supporting documents' }
  ]

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={true} user={{ email: user.email!, isAdmin: profile?.role === "admin" }} />

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="text-binance-gold">KYC</span> Verification
          </h1>
          <p className="text-xl text-binance-light-gray max-w-2xl mx-auto">
            Complete your identity verification to unlock full platform features
          </p>
        </div>

        {/* KYC Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="binance-card">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-binance-gold mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{kycStatus.level}</div>
              <div className="text-sm text-binance-light-gray">Verification Level</div>
            </CardContent>
          </Card>
          <Card className="binance-card">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{kycStatus.progress}%</div>
              <div className="text-sm text-binance-light-gray">Progress</div>
            </CardContent>
          </Card>
          <Card className="binance-card">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-binance-gold mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{kycStatus.documentsUploaded}/{kycStatus.maxDocuments}</div>
              <div className="text-sm text-binance-light-gray">Documents</div>
            </CardContent>
          </Card>
          <Card className="binance-card">
            <CardContent className="p-6 text-center">
              <UserCheck className="h-8 w-8 text-binance-gold mx-auto mb-3" />
              <div className="text-lg font-bold text-white mb-1">{kycStatus.verificationTime}</div>
              <div className="text-sm text-binance-light-gray">Review Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requirements Checklist */}
          <div className="lg:col-span-2">
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-binance-gold" />
                  Verification Requirements
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Complete all required documents for full verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-binance-dark-gray/30 border border-binance-dark-gray/50">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      req.status === 'uploaded' ? 'bg-green-500/20' :
                      req.status === 'pending' ? 'bg-yellow-500/20' :
                      req.status === 'required' ? 'bg-red-500/20' :
                      'bg-binance-dark-gray/50'
                    }`}>
                      {req.status === 'uploaded' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : req.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : req.status === 'required' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-binance-light-gray" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{req.name}</h4>
                      <p className="text-sm text-binance-light-gray">{req.description}</p>
                    </div>
                    <Badge className={`${
                      req.status === 'uploaded' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      req.status === 'required' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-binance-dark-gray/50 text-binance-light-gray border-binance-dark-gray'
                    } border`}>
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upload Documents */}
            <Card className="binance-card mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5 text-binance-gold" />
                  Upload Documents
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Submit your verification documents securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KYCUploadForm />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-binance-gold" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-10 w-10 text-yellow-500" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Under Review</h3>
                  <p className="text-sm text-binance-light-gray mb-4">
                    Your documents are being reviewed by our verification team
                  </p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                    Pending Verification
                  </Badge>
                </div>

                <div className="space-y-3 pt-4 border-t border-binance-dark-gray">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-binance-light-gray">Verification Level</span>
                    <span className="text-sm text-white">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-binance-light-gray">Documents Submitted</span>
                    <span className="text-sm text-white">2/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-binance-light-gray">Expected Review Time</span>
                    <span className="text-sm text-white">24-48h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Verification Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-binance-gold" />
                  <span className="text-sm text-white">Higher transaction limits</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-binance-gold" />
                  <span className="text-sm text-white">International transfers</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-binance-gold" />
                  <span className="text-sm text-white">Enhanced security features</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-binance-gold" />
                  <span className="text-sm text-white">Priority customer support</span>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/contact">
                  <Button className="w-full binance-button justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View FAQ
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}