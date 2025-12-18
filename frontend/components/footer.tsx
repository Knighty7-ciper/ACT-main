import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { AdminAccessDialog } from "./admin-access-dialog"
import { useAdminAccess } from "@/lib/hooks/useAdminAccess"

export function Footer() {
  const { isAdminDialogOpen, grantAdminAccess, closeAdminDialog } = useAdminAccess()
  return (
    <footer className="border-t-4 border-border bg-muted/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent shadow-lg">
                <span className="text-2xl">🌍</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-black">PESA-AFRIK</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pan-African Exchange
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Building Africa's financial future through innovative blockchain technology and unified currency
              solutions.
            </p>
            <div className="flex gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-sans text-lg font-bold">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/exchange" className="text-muted-foreground transition-colors hover:text-foreground">
                  Exchange
                </Link>
              </li>
              <li>
                <Link href="/converter" className="text-muted-foreground transition-colors hover:text-foreground">
                  Currency Converter
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="text-muted-foreground transition-colors hover:text-foreground">
                  Transactions
                </Link>
              </li>
              <li>
                <Link href="/kyc" className="text-muted-foreground transition-colors hover:text-foreground">
                  KYC Verification
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-sans text-lg font-bold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-muted-foreground transition-colors hover:text-foreground">
                  News & Updates
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contact Us
                </Link>
              </li>

            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-sans text-lg font-bold">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">support@pesa-afrik.com</p>
                  <p className="text-muted-foreground">business@pesa-afrik.com</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">+234 800 PESA-AFRIK</p>
                  <p className="text-muted-foreground">+254 700 PESA-AFRIK</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Lagos Financial District
                  <br />
                  Victoria Island, Lagos, Nigeria
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 Pesa-Afrik. All rights reserved. Licensed and regulated.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/compliance" className="text-muted-foreground transition-colors hover:text-foreground">
                Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin Access Dialog */}
      <AdminAccessDialog 
        isOpen={isAdminDialogOpen}
        onClose={closeAdminDialog}
        onSuccess={grantAdminAccess}
      />
    </footer>
  )
}
