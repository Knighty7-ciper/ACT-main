import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Wallet, TrendingUp, Lock, Users, FileText, ChevronRight, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      question: 'What makes Pesa-Afrik different from other cryptocurrencies?',
      answer: 'Pesa-Afrik is anchored to real-world purchasing power through a standardized basket of essential goods. Unlike Bitcoin or Ethereum, which derive value from speculation, Pesa-Afrik maintains consistent value across African economies by adjusting to local price levels.'
    },
    {
      question: 'How is the PPP value calculated?',
      answer: 'We collect prices for a standardized basket of goods (food staples, fuel, utilities, transport) from verified sources across African countries. The PPP algorithm compares these prices to determine the fair value of Pesa-Afrik in each region.'
    },
    {
      question: 'Do I need a bank account to use Pesa-Afrik?',
      answer: 'No. Pesa-Afrik is designed for financial sovereignty. You only need a cryptocurrency wallet to send, receive, and store Pesa. No bank account, no KYC (for basic usage), no geographic restrictions across Africa.'
    },
    {
      question: 'Can Pesa-Afrik protect against inflation?',
      answer: 'Yes. Because Pesa-Afrik is anchored to real goods, it maintains purchasing power regardless of local currency inflation. If your national currency loses value, Pesa-Afrik adjusts to preserve its buying power for essential goods.'
    },
    {
      question: 'Is my data safe and private?',
      answer: 'Pesa-Afrik prioritizes privacy. We do not collect personal information for basic wallet usage. All transactions are on-chain but pseudonymous. Your financial data belongs to you.'
    },
    {
      question: 'How can I get Pesa-Afrik?',
      answer: 'You can get Pesa-Afrik through peer-to-peer exchanges, decentralized exchanges, or by earning it through services. We also offer fiat on-ramps for direct purchase in supported African regions.'
    }
  ];

  const features = [
    {
      icon: Globe,
      title: 'Borderless Value',
      description: 'Send value anywhere in Africa with consistent purchasing power. No cross-border fees or currency conversion losses.'
    },
    {
      icon: Shield,
      title: 'Inflation Protection',
      description: 'Anchored to real goods, not speculative assets. Your wealth maintains real-world buying power across the continent.'
    },
    {
      icon: Wallet,
      title: 'Bankless Freedom',
      description: 'Full control of your funds with non-custodial wallets. No intermediaries, no frozen accounts, no barriers.'
    },
    {
      icon: Lock,
      title: 'Transparent Code',
      description: 'All smart contracts are audited and open source. The PPP algorithm is fully verifiable by anyone.'
    },
    {
      icon: TrendingUp,
      title: 'Fair Valuation',
      description: 'No pump and dump schemes. Value derives from African economic reality, not market manipulation.'
    },
    {
      icon: Users,
      title: 'African Community',
      description: 'Join thousands across Africa who believe in fair, accessible money for everyone on the continent.'
    }
  ];

  const team = [
    {
      name: 'John Kamwengu',
      role: 'CEO',
      bio: 'Leading Pesa-Afrik with vision and determination to transform African finance.',
      imageUrl: '/images/team/john-kamwengu.jpg'
    },
    {
      name: 'Brian Kiarie',
      role: 'Lead Senior Developer',
      bio: 'Building the future of African finance through code and blockchain innovation.',
      imageUrl: '/images/team/brian-kiarie.jpg'
    },
    {
      name: 'Doreen Wawira',
      role: 'Developer',
      bio: 'Passionate about creating accessible financial tools for all Africans.',
      imageUrl: '/images/team/doreen-wawira.jpg'
    },
    {
      name: 'David Kisham',
      role: 'Developer',
      bio: 'Dedicated to building secure and reliable financial infrastructure.',
      imageUrl: '/images/team/david-kisham.jpg'
    }
  ];

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-12 bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/50 via-slate-50 to-white" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4 md:mb-6">
              About Pesa-Afrik
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8 px-2">
              We're building money that works for every African, not just the privileged few. 
              Financial sovereignty through code, not banks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What Inspired Pesa-Afrik */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stack on mobile, 2 columns on lg+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/images/culture-afrik.jpeg" 
                  alt="African Culture and Heritage" 
                  className="w-full h-64 sm:h-80 md:h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                  <p className="text-white font-medium text-sm md:text-lg">
                    Rooted in African heritage, built for the future
                  </p>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 md:w-24 md:h-24 bg-gold-500/20 rounded-full blur-2xl" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary-100 text-primary-700 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                Our Story
              </div>
              
              <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4 md:mb-6">
                Inspired by Africa, Built for Africans
              </h2>
              
              <div className="space-y-4 md:space-y-6 text-slate-600 text-sm md:text-base">
                <p>
                  Pesa-Afrik was born from a simple observation: Africa doesn't need imported solutions 
                  that ignore our reality. We needed money designed for us, by us.
                </p>
                <p>
                  The name itself honors African heritage — "Pesa" means money in Swahili, and it's 
                  used across many African languages. It's a reminder that this currency belongs to 
                  the people of this continent.
                </p>
                <p>
                  From the vibrant markets of Lagos to the tech hubs of Nairobi, from the traders of 
                  Cairo to the entrepreneurs of Johannesburg — Pesa-Afrik represents a unified vision 
                  of financial sovereignty for all Africans.
                </p>
                <p>
                  We believe in the power of African innovation, the strength of our cultural unity, 
                  and the promise of blockchain technology to create a fairer financial system.
                </p>
              </div>

              <div className="mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3">
                {[
                  'African Unity',
                  'Financial Freedom',
                  'Cultural Pride',
                  'Technological Innovation'
                ].map((value, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 md:px-4 md:py-2 bg-primary-50 text-primary-700 rounded-full text-xs md:text-sm font-medium"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-1"
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4 md:mb-6">
                The Problem With Money in Africa
              </h2>
              <div className="space-y-4 md:space-y-6 text-slate-600 text-sm md:text-base">
                <p>
                  Every day, millions of Africans wake up to money that buys a little less than it did yesterday. 
                  Through inflation, currency manipulation, and banking barriers, traditional money fails its 
                  most basic purpose: storing and transferring value reliably.
                </p>
                <p>
                  Cryptocurrencies promised to fix this, but most have become speculative assets divorced from 
                  real-world value. Bitcoin may go to the moon, but it doesn't help someone in Kenya 
                  preserve their savings from currency fluctuation.
                </p>
                <p>
                  Pesa-Afrik takes a different approach. Instead of fighting governments or promising impossible 
                  returns, we anchor value to what actually matters: the goods and services people need every day 
                  across the African continent.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-2 bg-gradient-to-br from-primary-50 to-gold-50 rounded-xl md:rounded-2xl p-5 md:p-8"
            >
              <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-4 md:mb-6">Our Solution</h3>
              <div className="space-y-3 md:space-y-4">
                {[
                  'PPP-based valuation algorithm',
                  'Standardized African commodity basket',
                  'Real-time price oracle integration',
                  'Decentralized governance',
                  'Bankless, borderless transfers',
                  'Transparent and auditable'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2 md:gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-3 md:mb-4">
              Built on Solid Principles
            </h2>
            <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto px-2">
              Every feature designed to restore fairness to value exchange across Africa
            </p>
          </div>

          {/* Stack on mobile, 2 columns on md, 3 on lg */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-100 to-gold-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm md:text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-3 md:mb-4">
              Meet the Founders
            </h2>
            <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto px-2">
              The team behind Pesa-Afrik, committed to building financial freedom for all Africans
            </p>
          </div>

          {/* Stack on mobile, 2 columns on md, 4 on lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-100 to-gold-100 rounded-full mx-auto mb-3 md:mb-4 overflow-hidden shadow-lg">
                  <img 
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm md:text-lg">{member.name}</h3>
                <p className="text-xs md:text-sm text-primary-600 mb-1 md:mb-2 font-medium">{member.role}</p>
                <p className="text-xs md:text-sm text-slate-500">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-3 md:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-lg text-slate-600">
              Everything you need to know about Pesa-Afrik
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-4 py-3 md:px-6 md:py-4 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-slate-900 text-sm md:text-base pr-2">{faq.question}</span>
                  <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 text-slate-400 transition-transform flex-shrink-0 ${
                    activeFaq === index ? 'rotate-90' : ''
                  }`} />
                </button>
                
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-3 md:px-6 md:pb-4"
                  >
                    <p className="text-slate-600 text-sm md:text-base">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-4 md:mb-6">
            Ready to Reclaim Your Financial Freedom?
          </h2>
          <p className="text-sm md:text-lg text-primary-100 mb-6 md:mb-8 px-2">
            Join thousands of people across Africa who are building a fairer financial system with Pesa-Afrik.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-2 sm:px-0">
            <a href="/register" className="btn-primary-gold flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 text-center">
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
              <span>Get Started</span>
            </a>
            <a href="/basket" className="btn-secondary bg-white/10 border-white/20 text-white 
                                         hover:bg-white/20 flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 text-center">
              <FileText className="w-4 h-4 md:w-5 md:h-5" />
              <span>Read the Whitepaper</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;