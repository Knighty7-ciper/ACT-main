import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, FileText, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Disclaimer</h1>
          <p className="text-xl text-amber-100 max-w-2xl">Important legal information regarding cryptocurrency investments.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-8">Last updated: January 2026</p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Risk Warning</h3>
                  <p className="text-amber-700 text-sm">Cryptocurrency investments are highly volatile and speculative. You could lose some or all of your investment. Only invest what you can afford to lose.</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-4">1. No Financial Advice</h2>
            <p className="text-slate-600 mb-6">Pesa-Afrik provides a platform for decentralized finance but does not provide financial, investment, or legal advice. Any decisions you make are your own responsibility.</p>

            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Market Risk</h2>
            <p className="text-slate-600 mb-6">Cryptocurrency markets are highly volatile. Token values can fluctuate significantly. Past performance does not guarantee future results.</p>

            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Smart Contract Risk</h2>
            <p className="text-slate-600 mb-6">While our smart contracts have been audited, DeFi protocols carry inherent technical risks. There is always a possibility of bugs, exploits, or other technical issues.</p>

            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Regulatory Uncertainty</h2>
            <p className="text-slate-600 mb-6">Cryptocurrency regulations vary by jurisdiction and may change. It is your responsibility to comply with local laws and regulations.</p>

            <h2 className="text-xl font-bold text-slate-900 mb-4">5. PPP Mechanism</h2>
            <p className="text-slate-600 mb-6">The Pesa-Afrik PPP algorithm uses real commodity data, but market conditions can affect stability. There are no guarantees of perfect price stability.</p>

            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Third-Party Services</h2>
            <p className="text-slate-600 mb-6">Links to third-party websites, wallets, or services are provided for convenience. Pesa-Afrik is not responsible for their content or practices.</p>

            <h2 className="text-xl font-bold text-slate-900 mb-4">7. User Responsibility</h2>
            <p className="text-slate-600 mb-6">You are responsible for securing your wallet, recovery phrase, and private keys. Never share your recovery phrase with anyone. Pesa-Afrik cannot recover lost funds.</p>

            <div className="bg-slate-100 rounded-xl p-6 mt-8">
              <h3 className="font-semibold text-slate-900 mb-2">Questions?</h3>
              <p className="text-slate-600 mb-4">If you have questions about this disclaimer, please contact our support team.</p>
              <Link to="/support" className="text-emerald-600 font-medium hover:text-emerald-700">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DisclaimerPage;
