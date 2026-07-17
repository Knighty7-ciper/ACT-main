import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Wallet, TrendingUp, DollarSign, Clock, Shield, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ExchangePage = () => {
  const features = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Non-Custodial Trading',
      description: 'Your funds, your control. Trade directly from your wallet without depositing to an exchange.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Best Rates',
      description: 'Access competitive rates through our decentralized liquidity pools.'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Instant Settlement',
      description: 'Trade and settle in seconds, not days. No waiting for bank transfers.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Audited',
      description: 'All smart contracts are audited and transparent. Your security is our priority.'
    }
  ];

  const tradingPairs = [
    { pair: 'PESA/USDT', volume: '$2.4M', change: '+2.3%', liquidity: 'High' },
    { pair: 'PESA/ETH', volume: '$1.8M', change: '+1.8%', liquidity: 'High' },
    { pair: 'PESA/USDC', volume: '$980K', change: '-0.5%', liquidity: 'Medium' },
    { pair: 'PESA/DAI', volume: '$450K', change: '+0.9%', liquidity: 'Medium' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Pesa-Afrik <span className="text-emerald-400">Exchange</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mb-8">
            Trade Pesa-Afrik with confidence. Decentralized, secure, and designed for the African market.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
              Start Trading
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/wallet" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
              Connect Wallet
            </Link>
          </div>
        </div>
      </section>

      {/* Trading Pairs */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Trading Pairs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tradingPairs.map((pair) => (
              <div key={pair.pair} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900">{pair.pair}</span>
                  <span className={`text-sm font-medium ${pair.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {pair.change}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">24h Volume</span>
                    <span className="text-slate-900 font-medium">{pair.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Liquidity</span>
                    <span className="text-slate-900 font-medium">{pair.liquidity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Why Trade on Pesa-Afrik</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Experience the future of African cryptocurrency trading</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-slate-300 mb-8">Join thousands of users trading Pesa-Afrik across Africa</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
              Create Free Account
            </Link>
            <Link to="/wallet" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">
              Connect Wallet
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExchangePage;
