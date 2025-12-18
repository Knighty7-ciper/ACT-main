import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, FileText, Globe, Lock } from "lucide-react"
import Link from "next/link"
import StandardNav from "@/components/standard-nav"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />

      <main className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-binance-light-gray hover:text-binance-gold transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Legal Information</h1>
          <p className="text-xl text-binance-light-gray">Terms of service, privacy policy, and legal documents</p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="#terms">
            <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-binance-gold mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Terms of Service</h3>
                <p className="text-binance-light-gray text-sm">User agreements and conditions</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="#privacy">
            <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Privacy Policy</h3>
                <p className="text-binance-light-gray text-sm">How we protect your data</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="#compliance">
            <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Compliance</h3>
                <p className="text-binance-light-gray text-sm">Regulatory information</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="#disclosures">
            <Card className="binance-card hover:border-binance-gold/30 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Disclosures</h3>
                <p className="text-binance-light-gray text-sm">Legal disclosures</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Terms of Service */}
        <div id="terms" className="mb-16">
          <Card className="binance-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-binance-gold" />
                Terms of Service
              </CardTitle>
              <CardDescription className="text-binance-light-gray">
                Last updated: January 1, 2025
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h3>
                <p className="text-binance-light-gray">
                  By accessing and using PESA-AFRIK services, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-3">2. Description of Service</h3>
                <p className="text-binance-light-gray">
                  PESA-AFRIK provides a digital currency exchange platform facilitating the trading of African Currency Token (ACT) 
                  and other supported currencies. Our services include, but are not limited to, currency exchange, wallet services, 
                  and financial transactions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">3. User Responsibilities</h3>
                <p className="text-binance-light-gray">
                  Users are responsible for maintaining the confidentiality of their account information and for all activities 
                  that occur under their account. Users agree to provide accurate and complete information and to update 
                  such information as it changes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">4. Prohibited Uses</h3>
                <p className="text-binance-light-gray">
                  You may not use our service for any unlawful purpose or to solicit others to engage in unlawful activities. 
                  You agree not to use the service in any way that could damage, disable, overburden, or impair our servers or networks.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">5. Limitation of Liability</h3>
                <p className="text-binance-light-gray">
                  In no event shall PESA-AFRIK, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                  be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                  limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Policy */}
        <div id="privacy" className="mb-16">
          <Card className="binance-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-500" />
                Privacy Policy
              </CardTitle>
              <CardDescription className="text-binance-light-gray">
                Last updated: January 1, 2025
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Information We Collect</h3>
                <p className="text-binance-light-gray">
                  We collect information you provide directly to us, such as when you create an account, make a transaction, 
                  or contact us for support. This may include your name, email address, phone number, government ID for verification, 
                  and financial information.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-3">How We Use Your Information</h3>
                <p className="text-binance-light-gray">
                  We use the information we collect to provide, maintain, and improve our services, process transactions, 
                  send you technical notices and support messages, and communicate with you about products, services, 
                  and events.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Information Sharing</h3>
                <p className="text-binance-light-gray">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except as described 
                  in this policy. We may share information in the following circumstances: with your consent, to comply with 
                  legal obligations, to protect our rights and interests, or in connection with a business transfer.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Data Security</h3>
                <p className="text-binance-light-gray">
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. These measures include encryption, secure socket layer technology, 
                  and regular security assessments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance */}
        <div id="compliance" className="mb-16">
          <Card className="binance-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Regulatory Compliance
              </CardTitle>
              <CardDescription className="text-binance-light-gray">
                Our commitment to regulatory standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Anti-Money Laundering (AML)</h3>
                <p className="text-binance-light-gray">
                  PESA-AFRIK is committed to preventing money laundering and terrorist financing. We have implemented 
                  comprehensive AML programs that include customer identification procedures, transaction monitoring, 
                  and suspicious activity reporting.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Know Your Customer (KYC)</h3>
                <p className="text-binance-light-gray">
                  We require all users to complete identity verification procedures in accordance with applicable laws and regulations. 
                  This includes identity document verification, biometric authentication, and ongoing monitoring of customer activity.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Licensing and Registration</h3>
                <p className="text-binance-light-gray">
                  PESA-AFRIK operates under appropriate licenses and registrations in applicable jurisdictions. 
                  We maintain compliance with all relevant financial services regulations in the countries where we operate.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Disclosures */}
        <div id="disclosures" className="mb-16">
          <Card className="binance-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                Legal Disclosures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Risk Disclosure</h3>
                <p className="text-binance-light-gray">
                  Trading in digital currencies involves substantial risk and may not be suitable for all investors. 
                  The value of digital currencies can be highly volatile and subject to sudden and significant changes. 
                  You should carefully consider whether trading is suitable for you in light of your financial situation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Investment Advice Disclaimer</h3>
                <p className="text-binance-light-gray">
                  PESA-AFRIK does not provide investment advice, legal advice, tax advice, or any other advisory services. 
                  All content provided through our platform is for informational purposes only and should not be considered 
                  as professional advice.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Governing Law</h3>
                <p className="text-binance-light-gray">
                  These terms shall be interpreted and governed by the laws of the jurisdiction in which PESA-AFRIK is incorporated, 
                  without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved 
                  through arbitration in accordance with the rules of the relevant arbitration association.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="binance-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Questions About Our Legal Policies?</h2>
            <p className="text-binance-light-gray mb-6">
              If you have any questions about our legal policies or need additional information, please contact our legal team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="binance-button text-lg px-8 py-3">
                  Contact Legal Team
                </Button>
              </Link>
              <Button variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black text-lg px-8 py-3">
                legal@pesa-afrik.com
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
