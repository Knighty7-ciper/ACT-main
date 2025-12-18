import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/contact-form"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import StandardNav from "@/components/standard-nav"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-6xl font-black text-white">CONTACT US</h1>
          <p className="mx-auto max-w-2xl text-xl text-binance-light-gray">
            Have questions? We're here to help. Reach out to our team anytime.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Get In Touch</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-binance-gold to-yellow-600">
                    <Mail className="h-6 w-6 text-binance-black" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-white">Email</h3>
                    <p className="text-binance-light-gray">support@pesa-afrik.com</p>
                    <p className="text-binance-light-gray">business@pesa-afrik.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-binance-gold to-yellow-600">
                    <Phone className="h-6 w-6 text-binance-black" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-white">Phone</h3>
                    <p className="text-binance-light-gray">+234 800 PESA-AFRIK</p>
                    <p className="text-binance-light-gray">+254 700 PESA-AFRIK</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-binance-gold to-yellow-600">
                    <MapPin className="h-6 w-6 text-binance-black" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-white">Headquarters</h3>
                    <p className="text-binance-light-gray">Lagos Financial District</p>
                    <p className="text-binance-light-gray">Victoria Island, Lagos, Nigeria</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-binance-gold to-yellow-600">
                    <Clock className="h-6 w-6 text-binance-black" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-white">Business Hours</h3>
                    <p className="text-binance-light-gray">Monday - Friday: 8:00 AM - 6:00 PM WAT</p>
                    <p className="text-binance-light-gray">24/7 Emergency Support Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl font-bold text-white">Regional Offices</h3>
                <div className="space-y-2 text-sm text-binance-light-gray">
                  <p>🇰🇪 Nairobi, Kenya - Westlands Business District</p>
                  <p>🇿🇦 Johannesburg, South Africa - Sandton City</p>
                  <p>🇬🇭 Accra, Ghana - Airport Residential Area</p>
                  <p>🇪🇬 Cairo, Egypt - New Cairo Business District</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
