import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Smartphone, Globe, CreditCard, QrCode, Key, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WalletPage = () => {
  const features = [
    {
      icon: <Key className="w-6 h-6" />,
      title: 'Non-Custodial',
      description: 'You control your keys. You control your funds. No third-party access.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Bank-Grade Security',
      description: 'Industry-leading encryption and security protocols protect your assets.'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Cross-Platform',
      description: 'Access your wallet from web, mobile, or browser extension.'
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'Easy Transfers',
      description: 'Scan QR codes or use addresses for quick, borderless transfers.'
    }
  ];

  const stats = [
    { label: 'Users Worldwide', value: '45,000+' },
    { label: 'PESA Transferred', value: '$12M+' },
    { label: 'African Countries', value: '12+' },
    { label: 'Uptime', value: '99.9%' }
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
            Pesa-Afrik <span className="text-emerald-400">Wallet</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mb-8">
            The secure, non-custodial wallet designed for African users. Control your wealth without banks.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
              Create Wallet
            </Link>
            <Link to="/login" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">
              Access Existing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-emerald-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Wallet Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Everything you need to manage your PESA tokens securely</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-12 text-center">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your email or connect wallet' },
              { step: '02', title: 'Secure Your Keys', desc: 'Receive and securely store your recovery phrase' },
              { step: '03', title: 'Start Transacting', desc: 'Send, receive, and manage your PESA tokens' }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-4xl font-bold text-slate-200 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Get Your Wallet?</h2>
          <p className="text-slate-300 mb-8">Create your Pesa-Afrik wallet in minutes</p>
          <Link to="/register" className="px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors inline-flex items-center gap-2">
            Create Free Wallet
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WalletPage;
