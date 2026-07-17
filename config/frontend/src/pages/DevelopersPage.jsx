import { Link } from 'react-router-dom';
import { ArrowLeft, FileCode, Terminal, BookOpen, GitBranch, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DevelopersPage = () => {
  const resources = [
    { title: 'API Documentation', desc: 'Complete API reference with examples', icon: <BookOpen className="w-6 h-6" />, link: '/api' },
    { title: 'SDK Downloads', desc: 'Official SDKs for major platforms', icon: <Download className="w-6 h-6" /> },
    { title: 'Smart Contracts', desc: 'Deployed contracts and source code', icon: <FileCode className="w-6 h-6" /> },
    { title: 'Testnet', desc: 'Practice without real funds', icon: <GitBranch className="w-6 h-6" /> },
  ];

  const quickLinks = [
    { name: 'Authentication', status: 'active' },
    { name: 'Wallets', status: 'active' },
    { name: 'Transactions', status: 'active' },
    { name: 'Staking', status: 'active' },
    { name: 'Swaps', status: 'coming-soon' },
    { name: 'NFTs', status: 'coming-soon' },
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Developers</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Build on Pesa-Afrik. Tools, documentation, and resources for developers.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            {resources.map((res) => (
              <div key={res.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                  {res.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{res.title}</h3>
                <p className="text-slate-600 text-sm">{res.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">API Endpoints</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <div key={link.name} className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
                <span className="font-medium text-slate-900">{link.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${link.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {link.status === 'active' ? 'Live' : 'Coming Soon'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-900 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Quick Start</h3>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <p className="text-emerald-400"># Install SDK</p>
              <p className="text-white">npm install @pesaafrik/sdk</p>
              <p className="text-emerald-400 mt-4"># Initialize</p>
              <p className="text-purple-400">import</p> <p className="text-white">{`{ PesaAfrik }`}</p> <p className="text-purple-400">from</p> <p className="text-amber-300">'@pesaafrik/sdk'</p>
              <p className="text-slate-400 mt-2">const client = new PesaAfrik(API_KEY)</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Download icon component
const Download = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default DevelopersPage;
