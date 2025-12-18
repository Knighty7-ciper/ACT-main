import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import StandardNav from "@/components/standard-nav"
import { Shield, Globe, TrendingUp, Users, Award, Target, Code, Database, Smartphone } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="glassmorphism-container">
      <StandardNav />

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-6xl font-black text-white">ABOUT ACT</h1>
          <p className="mx-auto max-w-3xl text-xl text-binance-light-gray">
            A blockchain-powered currency solution born from months of late nights, countless cups of coffee, and a passion for solving real African financial problems
          </p>
        </div>

        <div className="mb-16">
          <Card className="binance-card">
            <CardContent className="p-8">
              <h2 className="mb-6 text-4xl font-bold text-white text-center">The Story Behind ACT</h2>
              <p className="text-lg text-binance-light-gray mb-6">
                This project started as a simple question during my computer science studies: "What if we could make sending money across Africa as easy as sending a text message?" 
              </p>
              <p className="text-lg text-binance-light-gray mb-6">
                What began as curiosity quickly turned into months of dedication. Late nights debugging TypeScript errors, weekends spent learning about Stellar blockchain, and countless iterations of "let me try this approach instead."
              </p>
              <p className="text-lg text-binance-light-gray">
                ACT isn't just code - it's months of learning, failing, fixing, and growing. Every line was typed with the hope that maybe, just maybe, this could make someone's life a little easier.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-2">
          <Card className="binance-card">
            <CardContent className="p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--binance-gradient)' }}>
                <Code className="h-8 w-8 text-binance-black" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white">What We Built</h2>
              <p className="text-lg text-binance-light-gray">
                A full-stack blockchain platform using Next.js, NestJS, and Stellar. It's not perfect, but it works, and it represents months of learning something completely new every single day.
              </p>
            </CardContent>
          </Card>

          <Card className="binance-card">
            <CardContent className="p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--binance-gradient)' }}>
                <Target className="h-8 w-8 text-binance-black" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white">Why It Matters</h2>
              <p className="text-lg text-binance-light-gray">
                Every time I sent money home to family, I saw the frustration - high fees, long waits, complicated processes. This project is my attempt to make that better.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 text-center text-5xl font-black text-white">WHAT MAKES ACT DIFFERENT</h2>
          <Card className="binance-card">
            <CardContent className="p-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-4 text-5xl">🏆</div>
                  <h3 className="mb-2 text-xl font-bold text-white">Backed by Reality</h3>
                  <p className="text-binance-light-gray">30% gold, 40% USD, 30% EUR - not just promises on paper</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 text-5xl">⚡</div>
                  <h3 className="mb-2 text-xl font-bold text-white">Actually Works</h3>
                  <p className="text-binance-light-gray">Built on Stellar - tested transactions in under 3 seconds</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 text-5xl">🌍</div>
                  <h3 className="mb-2 text-xl font-bold text-white">African-First</h3>
                  <p className="text-binance-light-gray">Designed for Africa, by someone who understands the problems</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 text-center text-5xl font-black text-white">WHAT WE LEARNED BUILDING THIS</h2>
          <p className="mb-8 text-center text-lg text-binance-light-gray">
            Every feature was a learning experience - and yes, there were many debugging sessions
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Security Matters",
                description: "Learned that building secure wallets is harder than it looks - multi-signature and KYC took weeks to implement properly",
              },
              {
                icon: <Database className="h-8 w-8" />,
                title: "Database Design",
                description: "TypeORM taught me that good database design is an art - 19 tables with proper relationships wasn't easy",
              },
              {
                icon: <Smartphone className="h-8 w-8" />,
                title: "User Experience",
                description: "Built responsive design from scratch - making it work on mobile was surprisingly challenging",
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "African Payments",
                description: "PesaPal integration taught me how complex real payment systems are - APIs aren't always documented properly",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Blockchain Reality",
                description: "Stellar SDK documentation helped, but real transactions took days to get right - and that's okay",
              },
              {
                icon: <Code className="h-8 w-8" />,
                title: "Full-Stack Reality",
                description: "Frontend + Backend + Database + Blockchain taught me that building real systems means connecting dots you didn't know existed",
              },
            ].map((feature, index) => (
              <Card key={index} className="binance-card hover:border-binance-gold/30 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: 'var(--binance-gradient)' }}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-binance-light-gray">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 text-center text-5xl font-black text-white">THE TECH STACK</h2>
          <p className="mb-8 text-center text-lg text-binance-light-gray">
            What tools and technologies made this possible - and what a journey it was learning each one
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <div className="mb-4 text-5xl">⚛️</div>
                <h3 className="mb-2 text-xl font-bold text-white">Frontend</h3>
                <p className="text-sm text-binance-light-gray mb-4">Next.js, TypeScript, Tailwind CSS</p>
                <p className="text-xs text-binance-light-gray">Learning React hooks and server components was intense but rewarding</p>
              </CardContent>
            </Card>
            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <div className="mb-4 text-5xl">🐈</div>
                <h3 className="mb-2 text-xl font-bold text-white">Backend</h3>
                <p className="text-sm text-binance-light-gray mb-4">NestJS, TypeORM, PostgreSQL</p>
                <p className="text-xs text-binance-light-gray">NestJS dependency injection made backend development actually enjoyable</p>
              </CardContent>
            </Card>
            <Card className="binance-card">
              <CardContent className="p-6 text-center">
                <div className="mb-4 text-5xl">⭐</div>
                <h3 className="mb-2 text-xl font-bold text-white">Blockchain</h3>
                <p className="text-sm text-binance-light-gray mb-4">Stellar SDK, Smart Contracts</p>
                <p className="text-xs text-binance-light-gray">Stellar's documentation saved my sanity during development</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="binance-card border-binance-gold">
          <CardContent className="p-12 text-center">
            <h2 className="mb-4 text-5xl font-black text-white">TRY THE PROJECT</h2>
            <p className="mb-8 text-xl text-binance-light-gray">
              Months of work went into this. Take it for a spin - maybe you'll see the potential too.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="binance-button h-16 px-12 text-lg">
                Create Test Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
