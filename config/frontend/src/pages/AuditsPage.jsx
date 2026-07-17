import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AuditsPage = () => {
  const audits = [
    {
      company: 'CertiK',
      date: 'October 2025',
      scope: 'Smart Contracts & Core Protocol',
      report: 'View Full Report',
      status: 'Completed'
    },
    {
      company: 'Halborn',
      date: 'August 2025',
      scope: 'Security Assessment',
      report: 'View Full Report',
      status: 'Completed'
    },
    {
      company: 'Trail of Bits',
      date: 'June 2025',
      scope: 'Code Review',
      report: 'View Full Report',
      status: 'Completed'
    }
  ];

  const securityFeatures = [
    'Multi-signature wallet protocols',
    'Time-locked contract upgrades',
    'Bug bounty program ($100,000)',
    '24/7 security monitoring',
    'Penetration testing',
    'Formal verification'
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Security Audits</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Transparency and security are foundational to Pesa-Afrik. All our code is audited.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Audited & Verified</h2>
            <p className="text-slate-600">Pesa-Afrik smart contracts have been audited by leading security firms</p>
          </div>

          <div className="space-y-4 mb-12">
            {audits.map((audit, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{audit.company}</h3>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">{audit.status}</span>
                    </div>
                    <p className="text-slate-600 text-sm">{audit.scope} • {audit.date}</p>
                  </div>
                  <a href="#" className="flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700">
                    {audit.report}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Security Measures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {securityFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-2">Found a vulnerability?</p>
            <a href="#" className="text-emerald-600 font-medium hover:text-emerald-700">Report through our Bug Bounty Program →</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AuditsPage;
