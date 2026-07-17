import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Search, MessageCircle, Phone, Mail, FileText, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HelpPage = () => {
  const faqs = [
    { q: 'How do I create a Pesa-Afrik wallet?', a: 'Visit our registration page, enter your email, and follow the secure setup process. Your recovery phrase will be generated - save it securely!' },
    { q: 'What are the transaction fees?', a: 'Network fees apply based on blockchain activity. Pesa-Afrik charges no additional trading fees for PESA transfers.' },
    { q: 'How does Pesa-Afrik maintain stability?', a: 'Our PPP algorithm adjusts token value based on a basket of essential goods across African markets.' },
    { q: 'Is my funds safe?', a: 'Yes! Pesa-Afrik uses non-custodial wallets. You control your private keys. All smart contracts are audited.' },
    { q: 'How do I stake PESA tokens?', a: 'Go to the Earn section, choose your preferred staking option, and lock your tokens to earn rewards.' },
    { q: 'Can I use Pesa-Afrik internationally?', a: 'Pesa-Afrik works anywhere, but purchasing power is optimized for African markets.' },
  ];

  const categories = [
    { name: 'Getting Started', icon: <FileText className="w-6 h-6" />, count: 12 },
    { name: 'Wallet & Security', icon: <Shield className="w-6 h-6" />, count: 18 },
    { name: 'Transactions', icon: <ArrowRight className="w-6 h-6" />, count: 15 },
    { name: 'Staking & Earn', icon: <DollarSign className="w-6 h-6" />, count: 10 },
    { name: 'Troubleshooting', icon: <HelpCircle className="w-6 h-6" />, count: 8 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-xl text-slate-300 max-w-2xl mb-8">Find answers to common questions or contact our support team.</p>
          
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search for help..." className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{cat.name}</h3>
                <span className="text-xs text-slate-500">{cat.count} articles</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer font-medium text-slate-900 flex items-center justify-between">
                  {faq.q}
                </summary>
                <div className="px-6 pb-4 text-slate-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-emerald-100 mb-8">Our support team is available 24/7 to assist you</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/support" className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Submit a Request
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpPage;
