import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, TrendingUp, DollarSign, Shield, Clock, CheckCircle, Wallet } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EarnPage = () => {
  const earnOptions = [
    {
      name: 'Staking',
      description: 'Stake your PESA tokens and earn up to 12% APY',
      apy: '8-12%',
      minStake: '100 PESA',
      lockPeriod: '7-90 days',
      risk: 'Low',
      icon: <TrendingUp className="w-8 h-8" />
    },
    {
      name: 'Liquidity Pools',
      description: 'Provide liquidity to trading pairs and earn fees',
      apy: '5-25%',
      minStake: '50 PESA',
      lockPeriod: 'Flexible',
      risk: 'Medium',
      icon: <DollarSign className="w-8 h-8" />
    },
    {
      name: 'Savings',
      description: 'High-yield savings with daily interest payouts',
      apy: '5-8%',
      minStake: '10 PESA',
      lockPeriod: 'Flexible',
      risk: 'Low',
      icon: <Wallet className="w-8 h-8" />
    }
  ];

  const benefits = [
    'Daily interest payouts',
    'No lock-in requirements for Savings',
    'Flexible staking durations',
    'Earn fees from liquidity provision',
    'Compounding rewards available',
    'Fully auditable smart contracts'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Earn with <span className="text-emerald-300">Pesa-Afrik</span>
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mb-8">
            Put your PESA tokens to work. Earn competitive returns through staking, liquidity pools, and savings.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2">
              Start Earning
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Earn Options */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Choose Your Earning Strategy</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Multiple ways to grow your PESA holdings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {earnOptions.map((option) => (
              <div key={option.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                  {option.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{option.name}</h3>
                <p className="text-slate-600 mb-4 text-sm">{option.description}</p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">APY</span>
                    <span className="text-emerald-600 font-bold text-lg">{option.apy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Min Stake</span>
                    <span className="text-slate-900 font-medium">{option.minStake}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Lock Period</span>
                    <span className="text-slate-900 font-medium">{option.lockPeriod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Risk Level</span>
                    <span className={`font-medium ${option.risk === 'Low' ? 'text-emerald-600' : 'text-amber-600'}`}>{option.risk}</span>
                  </div>
                </div>
                <button className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                  Start Earning
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Why Earn with Pesa-Afrik?</h2>
              <p className="text-slate-600 mb-6">Our earning products are designed with African users in mind, offering flexibility, security, and competitive returns.</p>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Estimated Returns Calculator</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-2">Amount (PESA)</label>
                  <input type="number" placeholder="1,000" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-2">Duration</label>
                  <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>30 days (5% APY)</option>
                    <option>60 days (7% APY)</option>
                    <option>90 days (10% APY)</option>
                    <option>180 days (12% APY)</option>
                  </select>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="text-sm text-emerald-700 mb-1">Estimated Earnings</div>
                  <div className="text-2xl font-bold text-emerald-600">~ 100 PESA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2.4M</div>
              <div className="text-emerald-100 text-sm">Total Value Locked</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">12%</div>
              <div className="text-emerald-100 text-sm">Max APY</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">5,000+</div>
              <div className="text-emerald-100 text-sm">Active Stakers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$450K</div>
              <div className="text-emerald-100 text-sm">Rewards Paid</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EarnPage;
