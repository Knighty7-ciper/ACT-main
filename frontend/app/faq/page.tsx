import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import StandardNav from "@/components/standard-nav"

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is Pesa-Afrik?",
          a: "Pesa-Afrik is a Pan-African currency exchange platform that enables seamless cross-border transactions using the ACT (African Currency Token) backed by gold, USD, and EUR reserves.",
        },
        {
          q: "How do I create an account?",
          a: "Click 'Open Account' on the homepage, provide your email and password, verify your email, and complete the KYC process to start trading.",
        },
        {
          q: "Is Pesa-Afrik available in my country?",
          a: "We currently support 13+ African countries including Nigeria, Kenya, South Africa, Ghana, Egypt, Tanzania, Uganda, Morocco, Ethiopia, and more. Check our currency list for full coverage.",
        },
      ],
    },
    {
      category: "ACT Token",
      questions: [
        {
          q: "What is the ACT token?",
          a: "ACT (African Currency Token) is a basket-backed stablecoin designed for Pan-African transactions. It's backed 30% by gold, 40% by USD, and 30% by EUR for stability.",
        },
        {
          q: "How is ACT different from other cryptocurrencies?",
          a: "Unlike volatile cryptocurrencies, ACT is backed by physical reserves and designed specifically for African currency exchange, making it stable and practical for everyday transactions.",
        },
        {
          q: "Where can I use ACT?",
          a: "ACT can be used for cross-border payments, currency exchange, and transfers across all supported African countries on the Pesa-Afrik platform.",
        },
      ],
    },
    {
      category: "Transactions",
      questions: [
        {
          q: "How long do transactions take?",
          a: "Transactions on the Stellar blockchain typically settle within 3-5 seconds. Bank withdrawals may take 1-3 business days depending on your bank.",
        },
        {
          q: "What are the transaction fees?",
          a: "We charge minimal fees: 0.5% for currency exchanges and a flat 0.00001 XLM for blockchain transactions (less than $0.01).",
        },
        {
          q: "What are the transaction limits?",
          a: "Limits depend on your KYC verification level. Basic accounts: $1,000/day. Verified accounts: $10,000/day. Business accounts: Custom limits available.",
        },
      ],
    },
    {
      category: "Security",
      questions: [
        {
          q: "How secure is Pesa-Afrik?",
          a: "We use bank-grade security including multi-signature wallets, encrypted storage, 2FA authentication, and full KYC/AML compliance. Your funds are protected by Stellar blockchain technology.",
        },
        {
          q: "What is KYC and why is it required?",
          a: "KYC (Know Your Customer) is a regulatory requirement to verify user identity and prevent fraud. It helps us maintain a secure platform and comply with international financial regulations.",
        },
        {
          q: "Can I recover my account if I lose my password?",
          a: "Yes, you can reset your password using your registered email. However, you cannot recover your Stellar wallet secret key if lost, so please store it securely.",
        },
      ],
    },
    {
      category: "Wallets & Withdrawals",
      questions: [
        {
          q: "How do I withdraw funds?",
          a: "Navigate to your wallet, select the currency you want to withdraw, enter your bank details, and confirm the transaction. Funds typically arrive within 1-3 business days.",
        },
        {
          q: "Can I have multiple wallets?",
          a: "Yes, you can create wallets for different currencies. Each wallet has a unique Stellar address for receiving funds.",
        },
        {
          q: "What happens if I send funds to the wrong address?",
          a: "Blockchain transactions are irreversible. Always double-check the recipient address before sending. We recommend sending a small test amount first.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-6xl font-black">FREQUENTLY ASKED QUESTIONS</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Find answers to common questions about Pesa-Afrik, ACT token, and our services
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {faqs.map((category, idx) => (
            <Card key={idx} className="border-2">
              <CardContent className="p-8">
                <h2 className="mb-6 font-sans text-3xl font-bold">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="border-2 bg-gradient-to-br from-muted/30 to-background">
            <CardContent className="p-8">
              <h2 className="mb-4 font-sans text-3xl font-bold">Still Have Questions?</h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Our support team is available 24/7 to help you with any inquiries
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" className="font-bold">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="lg" variant="outline" className="border-2 font-bold bg-transparent">
                    Create Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
