import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Code, Copy, Check, ChevronRight, Terminal, 
  Globe, Shield, Clock, Database, AlertTriangle, 
  Wallet, ArrowRightLeft, TrendingUp, DollarSign,
  BookOpen, Key, Server, BarChart3, Layers, Users,
  ArrowRight, ExternalLink, Search, Play, Menu, X
} from 'lucide-react';

const ApiPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const codeExamples = {
    javascript: `// Get current PPP exchange rates
const response = await fetch('https://api.pesa-afrik.io/v1/rates', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();
console.log(data);`,
    python: `import requests

# Get current PPP exchange rates
response = requests.get(
    'https://api.pesa-afrik.io/v1/rates',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
data = response.json()
print(data)`,
    curl: `curl -X GET https://api.pesa-afrik.io/v1/rates \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  };

  const stats = [
    { value: '10M+', label: 'API Calls/Day' },
    { value: '45+', label: 'African Markets' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '<1s', label: 'Data Latency' },
  ];

  const products = [
    {
      title: 'On-Chain DEX API',
      description: 'Fetch real-time DEX trading data across African blockchain networks. Build trading interfaces and analytics tools.',
      icon: Layers,
    },
    {
      title: 'Historical Chart Data',
      description: 'Access comprehensive historical price and volume data. Build candlestick charts and market analysis tools.',
      icon: BarChart3,
    },
    {
      title: 'Exchange Data',
      description: 'Get pricing data from African exchanges and OTC desks. Track spreads, volume, and market depth.',
      icon: TrendingUp,
    },
    {
      title: 'NFT API',
      description: 'Explore NFT collections and marketplace activity across African NFT platforms and artists.',
      icon: DollarSign,
    },
  ];

  const networks = [
    { name: 'Ethereum', color: 'bg-purple-500' },
    { name: 'Bitcoin', color: 'bg-orange-500' },
    { name: 'Solana', color: 'bg-gradient-to-r from-purple-400 to-green-400' },
    { name: 'BNB', color: 'bg-yellow-500' },
    { name: 'More +', color: 'bg-slate-200' },
  ];

  const useCases = [
    {
      title: 'Analytics & Tools',
      description: 'Build dashboards and market analysis tools with real-time African crypto data.',
      icon: BarChart3,
    },
    {
      title: 'Exchanges & Wallets',
      description: 'Integrate African market data into exchanges, wallets, and trading platforms.',
      icon: Wallet,
    },
    {
      title: 'AI Agents',
      description: 'Power AI agents and chatbots with accurate, up-to-date cryptocurrency data.',
      icon: Code,
    },
    {
      title: 'Market Research',
      description: 'Access historical data for research, reports, and investment analysis.',
      icon: Globe,
    },
  ];

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - CoinGecko Style */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <a href="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-500" />
                Pesa-Afrik
              </a>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/cryptocurrencies" className="text-sm text-slate-600 hover:text-slate-900">Cryptocurrencies</a>
                <a href="/exchanges" className="text-sm text-slate-600 hover:text-slate-900">Exchanges</a>
                <a href="/api" className="text-sm text-slate-900 font-medium">API</a>
                <a href="/documentation" className="text-sm text-slate-600 hover:text-slate-900">Docs</a>
                <a href="/learn" className="text-sm text-slate-600 hover:text-slate-900">Learn</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <Search className="w-4 h-4" />
              </button>
              <a href="/login" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:block">Log in</a>
              <button className="px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                Sign up
              </button>
              <button 
                className="md:hidden p-2 text-slate-400"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean CoinGecko Style */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Build, Analyze & Scale with Africa's Most Trusted PPP Data API
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Comprehensive cryptocurrency data API for African markets. Access real-time PPP rates, 
              exchange data, and historical prices to build powerful applications.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
                <Key className="w-4 h-4" />
                Get Your API Key
              </button>
              <a href="/documentation" className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Read Documentation
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Clean Cards */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Explore Our Extensive Data</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <product.icon className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{product.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{product.description}</p>
                <button className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
                  Learn more
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Networks */}
      <section className="py-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {networks.map((network) => (
              <button
                key={network.name}
                className={`px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors flex items-center gap-2 ${network.name === 'More +' ? 'bg-slate-100' : ''}`}
              >
                {network.name !== 'More +' && (
                  <span className={`w-3 h-3 rounded-full ${network.color}`} />
                )}
                {network.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Common Use Cases</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <useCase.icon className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{useCase.title}</h3>
                <p className="text-sm text-slate-600">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Dark Theme */}
      <section className="py-12 md:py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Start Building?
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Get your API key today and start integrating Pesa-Afrik into your application.
            Our sandbox environment is free to use for development.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
              <Key className="w-4 h-4" />
              Get Your API Key
            </button>
            <a href="/documentation" className="px-5 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Read Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer - CoinGecko Style */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 lg:col-span-1">
              <a href="/" className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-emerald-500" />
                Pesa-Afrik
              </a>
              <p className="text-sm text-slate-500 mb-4">
                Africa's trusted cryptocurrency data platform. Building financial sovereignty through transparent, accurate data.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4" />
                SOC 2 Type 1 Certified
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Products</h4>
              <ul className="space-y-2">
                <li><a href="/api" className="text-sm text-slate-600 hover:text-slate-900">API</a></li>
                <li><a href="/sitemap" className="text-sm text-slate-600 hover:text-slate-900">Sitemap</a></li>
                <li><a href="/browser-extension" className="text-sm text-slate-600 hover:text-slate-900">Browser Extension</a></li>
                <li><a href="/mobile-app" className="text-sm text-slate-600 hover:text-slate-900">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/request-api" className="text-sm text-slate-600 hover:text-slate-900">Request API</a></li>
                <li><a href="/pub-api" className="text-sm text-slate-600 hover:text-slate-900">Public API</a></li>
                <li><a href="/rate-limit" className="text-sm text-slate-600 hover:text-slate-900">Rate Limit</a></li>
                <li><a href="/status" className="text-sm text-slate-600 hover:text-slate-900">API Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-sm text-slate-600 hover:text-slate-900">About</a></li>
                <li><a href="/careers" className="text-sm text-slate-600 hover:text-slate-900">Careers</a></li>
                <li><a href="/blog" className="text-sm text-slate-600 hover:text-slate-900">Blog</a></li>
                <li><a href="/contact" className="text-sm text-slate-600 hover:text-slate-900">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Socials</h4>
              <ul className="space-y-2">
                <li><a href="https://twitter.com/pesaafrik" className="text-sm text-slate-600 hover:text-slate-900">Twitter</a></li>
                <li><a href="https://t.me/pesaafrik" className="text-sm text-slate-600 hover:text-slate-900">Telegram</a></li>
                <li><a href="/discord" className="text-sm text-slate-600 hover:text-slate-900">Discord</a></li>
                <li><a href="/newsletter" className="text-sm text-slate-600 hover:text-slate-900">Newsletter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                © 2024 Pesa-Afrik. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="/privacy" className="text-sm text-slate-500 hover:text-slate-900">Privacy</a>
                <a href="/terms" className="text-sm text-slate-500 hover:text-slate-900">Terms</a>
                <a href="/cookies" className="text-sm text-slate-500 hover:text-slate-900">Cookie Settings</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ApiPage;
