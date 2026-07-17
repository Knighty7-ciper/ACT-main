import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, ChevronRight, Search, CheckCircle, ExternalLink, 
  Wallet, ArrowRight, Globe, Shield, CreditCard, Lock,
  HelpCircle, FileText, Zap, TrendingUp
} from 'lucide-react';

const DocumentationPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'getting-started', label: 'Getting Started', icon: Book },
    { id: 'wallet-setup', label: 'Wallet Setup', icon: Wallet },
    { id: 'basket', label: 'Basket Analysis', icon: TrendingUp },
    { id: 'stability', label: 'Stability Features', icon: Shield },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const content = {
    'getting-started': {
      title: 'Getting Started with Pesa-Afrik',
      description: 'Learn how to create your first wallet and start using Pesa-Afrik for cross-border value transfer.',
      steps: [
        {
          title: 'Create Your Wallet',
          content: 'Visit our registration page and follow the prompts to create your secure wallet. You will need a valid email address and government-issued ID for verification. The process typically takes 2-5 minutes.',
        },
        {
          title: 'Complete Identity Verification',
          content: 'We require identity verification (KYC) to comply with financial regulations across African jurisdictions. Upload a clear photo of your ID and complete the facial verification check.',
        },
        {
          title: 'Fund Your Account',
          content: 'Deposit funds using mobile money, bank transfer, or by converting existing cryptocurrency. Pesa-Afrik supports deposits in all major African currencies.',
        },
        {
          title: 'Start Transacting',
          content: 'Once funded, you can send Pesa-Afrik to anyone in our supported countries, use it for cross-border payments, or hold it as an inflation hedge.',
        },
      ],
    },
    'wallet-setup': {
      title: 'Wallet Setup and Security',
      description: 'Everything you need to know about securing and managing your Pesa-Afrik wallet.',
      sections: [
        {
          title: 'Creating Your Wallet',
          content: 'Your Pesa-Afrik wallet is generated using industry-standard cryptographic algorithms. Upon creation, you will receive a 12-word recovery phrase. Write this down and store it safely—never share it with anyone.',
        },
        {
          title: 'Enabling Two-Factor Authentication',
          content: 'We strongly recommend enabling 2FA using an authenticator app (Google Authenticator or Authy) for an additional layer of security. Go to Settings > Security > Two-Factor Authentication to set this up.',
        },
        {
          title: 'Backup and Recovery',
          content: 'Your recovery phrase is the only way to restore your wallet if you lose access. Store it in a secure location, preferably offline. Consider using a metal backup plate for long-term storage.',
        },
        {
          title: 'Session Management',
          content: 'You can view and manage active sessions from Settings > Security > Sessions. Revoke any sessions you do not recognize immediately.',
        },
      ],
    },
    'basket': {
      title: 'Understanding the Basket',
      description: 'Learn how our purchasing power parity algorithm creates a stable value layer for Africa.',
      sections: [
        {
          title: 'What is the Basket?',
          content: 'The Pesa-Afrik basket is a weighted collection of essential commodities priced across 10 African countries. This includes food staples (30%), proteins (20%), fuel and energy (25%), utilities (15%), and housing materials (10%).',
        },
        {
          title: 'How PPP is Calculated',
          content: 'Our algorithm continuously monitors real-world prices for basket items across all supported markets. The PPP ratio is calculated using a weighted geometric mean, ensuring no single market dominates the valuation.',
        },
        {
          title: 'Reading Basket Data',
          content: 'Navigate to the Basket page to compare PPP values across countries. Higher ratios indicate that local currency buys fewer goods (weaker purchasing power). Pesa-Afrik maintains consistent value regardless of which market you are in.',
        },
        {
          title: 'Rebalancing Schedule',
          content: 'Basket composition is reviewed quarterly. Major adjustments require governance approval. Price data is updated daily through our oracle network.',
        },
      ],
    },
    'stability': {
      title: 'Stability Features',
      description: 'Tools and metrics for understanding and maximizing the stability benefits of Pesa-Afrik.',
      sections: [
        {
          title: 'Stability Score',
          content: 'Each market receives a stability score (0-100) based on volatility, inflation hedge effectiveness, and historical price data. Higher scores indicate more stable value retention.',
        },
        {
          title: 'Volatility Index',
          content: 'The volatility index measures daily price variation as a percentage. Markets below 15% are considered low volatility, 15-30% moderate, and above 30% high volatility.',
        },
        {
          title: 'Inflation Hedge Calculator',
          content: 'Use our calculator to see how Pesa-Afrik compares to holding local currency over time. Input your investment amount and time horizon to compare projected value retention.',
        },
        {
          title: 'Risk Assessment',
          content: 'Each market receives a risk level (Low, Low-Medium, Medium, Medium-High, High) based on a combination of stability metrics, economic indicators, and historical performance.',
        },
      ],
    },
    'transactions': {
      title: 'Making Transactions',
      description: 'How to send, receive, and manage Pesa-Afrik transactions.',
      sections: [
        {
          title: 'Sending Pesa-Afrik',
          content: 'To send Pesa-Afrik, navigate to the Send page, enter the recipient wallet address (or select from contacts), specify the amount, and confirm. Transactions typically settle within 30 seconds.',
        },
        {
          title: 'Receiving Pesa-Afrik',
          content: 'Share your wallet address with the sender. Your address starts with "pesa" followed by a unique identifier. You can also generate a QR code for easy scanning.',
        },
        {
          title: 'Transaction Fees',
          content: 'Network fees are 0.1% of the transaction amount, with a minimum of $0.01. These fees go to network validators and help secure the blockchain.',
        },
        {
          title: 'Transaction History',
          content: 'View your complete transaction history in the Transactions tab. Each entry shows the date, amount, recipient/sender, status, and transaction hash.',
        },
      ],
    },
    'security': {
      title: 'Security Best Practices',
      description: 'Protect your assets with these security recommendations.',
      sections: [
        {
          title: 'Never Share Your Recovery Phrase',
          content: 'Your recovery phrase grants full access to your wallet. Pesa-Afrik staff will never ask for it. Store it offline in a secure location.',
        },
        {
          title: 'Use a Hardware Wallet',
          content: 'For large holdings, consider using a hardware wallet (Ledger or Trezor) with your Pesa-Afrik account. This keeps your private keys offline.',
        },
        {
          title: 'Verify Website URLs',
          content: 'Always ensure you are on the official Pesa-Afrik website before entering login credentials or connecting your wallet. Check for the lock icon in your browser.',
        },
        {
          title: 'Beware of Phishing',
          content: 'Never click links in unsolicited emails or messages. Pesa-Afrik will never ask you to "verify your wallet" or "claim tokens" through direct messages.',
        },
      ],
    },
    'faq': {
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions about using Pesa-Afrik.',
      items: [
        {
          q: 'What countries does Pesa-Afrik support?',
          a: 'Pesa-Afrik currently supports transactions to and from Kenya, Nigeria, South Africa, Ghana, Egypt, Morocco, Ethiopia, Tanzania, Uganda, and Cameroon. We are actively expanding to additional African markets.',
        },
        {
          q: 'How is Pesa-Afrik different from Bitcoin or other cryptocurrencies?',
          a: 'Unlike Bitcoin or Ethereum, Pesa-Afrik is designed for stability, not speculation. Its value is anchored to real-world purchasing power across Africa through our PPP algorithm.',
        },
        {
          q: 'Can I convert Pesa-Afrik back to local currency?',
          a: 'Yes. You can sell Pesa-Afrik for supported local currencies through our integrated exchange partners or peer-to-peer marketplace.',
        },
        {
          q: 'What happens if the algorithm fails?',
          a: 'Our smart contracts are fully decentralized and audited. Even if our servers go offline, the blockchain continues to operate. Oracle data is sourced from multiple providers for redundancy.',
        },
        {
          q: 'Is Pesa-Afrik regulated?',
          a: 'Pesa-Afrik complies with financial regulations in all operating jurisdictions. We hold appropriate licenses in Kenya (Central Bank), Nigeria (SEC), and Mauritius (FSC).',
        },
        {
          q: 'How long do transactions take?',
          a: 'Pesa-Afrik transactions typically confirm within 30 seconds. This is significantly faster than traditional cross-border transfers which can take 2-5 days.',
        },
      ],
    },
  };

  const currentContent = content[activeSection] || content['getting-started'];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4 flex items-center gap-3">
            <Book className="w-8 h-8 text-primary-600" />
            Documentation
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Complete guides and reference materials for using Pesa-Afrik. Find answers to your questions or learn how to build on our platform.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Additional Resources */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4">
                  Resources
                </p>
                <ul className="space-y-1">
                  <li>
                    <a href="/whitepaper" className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-primary-600 transition-colors">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Whitepaper</span>
                    </a>
                  </li>
                  <li>
                    <a href="/api" className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-primary-600 transition-colors">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">API Reference</span>
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border border-slate-200"
            >
              {/* Content Header */}
              <div className="px-8 py-6 border-b border-slate-200">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">
                  {currentContent.title}
                </h2>
                <p className="text-slate-600">{currentContent.description}</p>
              </div>

              {/* Content Body */}
              <div className="p-8">
                {currentContent.steps && (
                  <div className="space-y-8">
                    {currentContent.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-700">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                          <p className="text-slate-600 leading-relaxed">{step.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentContent.sections && (
                  <div className="space-y-8">
                    {currentContent.sections.map((section, index) => (
                      <div key={index} className="pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">{section.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{section.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {currentContent.items && (
                  <div className="space-y-6">
                    {currentContent.items.map((item, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-6">
                        <h3 className="font-semibold text-slate-900 mb-2 flex items-start gap-2">
                          <HelpCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          {item.q}
                        </h3>
                        <p className="text-slate-600 leading-relaxed pl-7">{item.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Navigation */}
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    const currentIndex = navItems.findIndex(item => item.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(navItems[currentIndex - 1].id);
                    }
                  }}
                  disabled={navItems[0].id === activeSection}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </button>
                <button
                  onClick={() => {
                    const currentIndex = navItems.findIndex(item => item.id === activeSection);
                    if (currentIndex < navItems.length - 1) {
                      setActiveSection(navItems[currentIndex + 1].id);
                    }
                  }}
                  disabled={navItems[navItems.length - 1].id === activeSection}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Support Card */}
            <div className="mt-8 bg-primary-600 rounded-xl p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
                  <p className="text-primary-100">
                    Our support team is available 24/7 to assist you with any questions.
                  </p>
                </div>
                <button className="px-6 py-3 bg-white text-primary-700 font-medium rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
