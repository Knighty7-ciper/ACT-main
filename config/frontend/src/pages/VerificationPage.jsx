import { Link } from 'react-router-dom';
import { ArrowLeft, UserCheck, Shield, Clock, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VerificationPage = () => {
  const tiers = [
    { name: 'Basic', limit: '$100/day', kyc: false, features: ['Send & receive up to $100/day', 'Wallet creation', 'Basic support'] },
    { name: 'Standard', limit: '$1,000/day', kyc: true, features: ['Send & receive up to $1,000/day', 'Full KYC verification', 'Priority support', 'Higher staking limits'] },
    { name: 'Premium', limit: '$10,000/day', kyc: true, features: ['Unlimited transactions', 'Enhanced KYC', 'Dedicated support', 'API access', 'Institutional features'] },
  ];

  const documents = [
    'Government-issued ID (Passport, National ID, Driver\'s License)',
    'Proof of address (Utility bill, Bank statement - 3 months)',
    'Selfie with ID document',
    'For companies: Business registration documents'
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Identity Verification</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Verify your identity to unlock higher limits and premium features.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Verification Tiers</h2>
            <p className="text-slate-600">Choose the level that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {tiers.map((tier) => (
              <div key={tier.name} className={`rounded-2xl p-6 border ${tier.name === 'Standard' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                {tier.name === 'Standard' && <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full mb-4 inline-block">Most Popular</span>}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-emerald-600 mb-4">{tier.limit}</div>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className={`w-5 h-5 ${tier.kyc ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-sm text-slate-600">{tier.kyc ? 'KYC Required' : 'No KYC Needed'}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${tier.name === 'Standard' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  {tier.kyc ? 'Start Verification' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Documents Required for KYC</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <li key={doc} className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VerificationPage;
