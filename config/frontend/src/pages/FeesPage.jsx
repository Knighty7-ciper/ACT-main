import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, ArrowUpRight, ArrowDownRight, Info, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FeesPage = () => {
  const fees = [
    { action: 'PESA Transfer', network: 'Network fee only', time: '~30 seconds', note: 'No Pesa-Afrik fee' },
    { action: 'Cross-border Transfer', network: 'Network fee only', time: '~2 minutes', note: 'Competitive rates' },
    { action: 'Swap (PESA/USDT)', network: '0.1%', time: '~15 seconds', note: 'Lowest in Africa' },
    { action: 'Staking', network: 'No fee', time: 'Instant', note: 'Earn while staking' },
    { action: 'Wallet Creation', network: 'Free', time: '~1 minute', note: 'No setup fee' },
  ];

  const faqs = [
    { q: 'Why do I pay network fees?', a: 'Network fees go to blockchain validators, not Pesa-Afrik. They secure the network and process transactions.' },
    { q: 'Are fees different by region?', a: 'No. Pesa-Afrik fees are the same regardless of where you are in Africa.' },
    { q: 'Can I avoid network fees?', a: 'Not completely, but staking reduces your exposure to congestion-based fee spikes.' },
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Fees & Pricing</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Transparent pricing. No hidden fees. The lowest rates in African crypto.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-100 font-semibold text-slate-700 text-sm">
              <div>Action</div>
              <div>Fee</div>
              <div>Processing Time</div>
            </div>
            {fees.map((fee) => (
              <div key={fee.action} className="grid grid-cols-3 gap-4 p-4 border-t border-slate-200 items-center">
                <div>
                  <div className="font-medium text-slate-900">{fee.action}</div>
                  <div className="text-xs text-emerald-600 mt-1">{fee.note}</div>
                </div>
                <div className="font-semibold text-slate-900">{fee.network}</div>
                <div className="text-slate-600 text-sm">{fee.time}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-emerald-50 rounded-xl p-6 border border-emerald-200">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-800 mb-1">Network vs Pesa-Afrik Fees</h3>
                <p className="text-emerald-700 text-sm">Pesa-Afrik charges minimal fees. Most costs are network fees that go directly to blockchain validators ensuring transaction security.</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer font-medium text-slate-900">{faq.q}</summary>
                <div className="px-6 pb-4 text-slate-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeesPage;
