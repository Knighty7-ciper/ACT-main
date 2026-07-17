import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ChevronDown, ChevronRight, TrendingUp, Globe, Shield, Users, Calendar, CheckCircle } from 'lucide-react';

const WhitepaperPage = () => {
  const [expandedSection, setExpandedSection] = useState('executive-summary');
  const [downloadFormat, setDownloadFormat] = useState('pdf');

  const sections = [
    { id: 'executive-summary', title: 'Executive Summary', icon: FileText },
    { id: 'problem-statement', title: 'Problem Statement', icon: Globe },
    { id: 'solution', title: 'Solution Architecture', icon: Shield },
    { id: 'tokenomics', title: 'Tokenomics', icon: TrendingUp },
    { id: 'roadmap', title: 'Roadmap', icon: Calendar },
    { id: 'team', title: 'Team', icon: Users },
  ];

  const content = {
    'executive-summary': {
      title: 'Executive Summary',
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 leading-relaxed">
            Pesa-Afrik is a decentralized cryptocurrency protocol designed to provide a stable, borderless value layer 
            for the African continent. Unlike traditional cryptocurrencies that experience extreme volatility, or fiat 
            currencies that suffer from chronic devaluation, Pesa-Afrik is anchored to real-world purchasing power 
            through a sophisticated basket of essential commodities.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            The protocol addresses three fundamental challenges facing African economies: currency volatility that erodes 
            savings, high cross-border transaction costs, and limited access to stable stores of value. By creating a 
            unified value transfer layer backed by a transparent, auditable algorithm, Pesa-Afrik enables individuals 
            and businesses to transact across borders without losing purchasing power to inflation or intermediaries.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-primary-700 mb-2">10</p>
              <p className="text-sm text-slate-600">Supported Markets</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-primary-700 mb-2">5</p>
              <p className="text-sm text-slate-600">Commodity Categories</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-primary-700 mb-2">0.1%</p>
              <p className="text-sm text-slate-600">Transaction Fee</p>
            </div>
          </div>
        </div>
      ),
    },
    'problem-statement': {
      title: 'Problem Statement',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900">The Currency Volatility Crisis</h3>
          <p className="text-slate-700 leading-relaxed">
            African currencies have experienced significant devaluation over the past two decades. The Nigerian Naira 
            has lost over 95% of its value since 2000. The Kenyan Shilling has declined by approximately 70% in the 
            same period. This chronic inflation erodes savings, discourages investment, and creates significant 
            challenges for businesses engaged in cross-border commerce.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8">High Cross-Border Costs</h3>
          <p className="text-slate-700 leading-relaxed">
            Remittances within Africa remain expensive, with average costs exceeding 8%—well above the 3% target 
            set by the Sustainable Development Goals. Traditional correspondent banking relationships have eroded, 
            forcing many transactions through expensive intermediaries. A worker in Nigeria sending money to their 
            family in Kenya may pay $20-30 in fees on a $200 transfer.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8">Limited Access to Stable Value</h3>
          <p className="text-slate-700 leading-relaxed">
            While cryptocurrencies like Bitcoin offer an alternative, their extreme volatility makes them unsuitable 
            as stores of value or mediums of exchange for everyday transactions. The same properties that make them 
            attractive as speculative assets—unlimited upside potential—make them dangerous for individuals trying 
            to protect their life savings from inflation.
          </p>
        </div>
      ),
    },
    'solution': {
      title: 'Solution Architecture',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900">The Pesa-Afrik Basket</h3>
          <p className="text-slate-700 leading-relaxed">
            The Pesa-Afrik protocol maintains a basket of essential commodities weighted according to typical African 
            household expenditure patterns. This basket serves as the underlying value reference for the Pesa-Afrik token:
          </p>
          <ul className="space-y-3 ml-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span><strong>Food Staples (30%):</strong> Rice, wheat flour, bread, maize meal—the basic caloric foundation of African diets.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span><strong>Proteins (20%):</strong> Chicken, beef, eggs, fish, milk—essential sources of nutrition.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span><strong>Fuel & Energy (25%):</strong> Diesel, petrol, cooking gas, charcoal—energy costs for cooking, transport, and electricity.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span><strong>Utilities (15%):</strong> Electricity, water, internet, mobile airtime—infrastructure services.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span><strong>Housing (10%):</strong> Cement, steel, roofing materials—construction costs.</span>
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8">PPP Calculation Methodology</h3>
          <p className="text-slate-700 leading-relaxed">
            The protocol continuously monitors commodity prices across all supported markets through a decentralized 
            oracle network. For each country, we calculate a price ratio comparing local prices to global reference 
            prices. The PPP value is derived using a weighted geometric mean of these ratios, ensuring that no single 
            market or commodity dominates the calculation.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8">Technical Infrastructure</h3>
          <p className="text-slate-700 leading-relaxed">
            Pesa-Afrik is built on Layer 2 infrastructure for scalability, with settlement on Ethereum mainnet for 
            security. The protocol uses a proof-of-stake consensus mechanism with validators distributed across 
            African countries. All smart contracts are open source and have been audited by multiple independent 
            security firms.
          </p>
        </div>
      ),
    },
    'tokenomics': {
      title: 'Tokenomics',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900">Token Distribution</h3>
          <div className="bg-slate-50 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <span className="font-medium text-slate-900">Community & Ecosystem</span>
                <span className="text-primary-600 font-semibold">40%</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <span className="font-medium text-slate-900">Team & Advisors</span>
                <span className="text-primary-600 font-semibold">20%</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <span className="font-medium text-slate-900">Public Sale</span>
                <span className="text-primary-600 font-semibold">15%</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <span className="font-medium text-slate-900">Foundation Reserve</span>
                <span className="text-primary-600 font-semibold">15%</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-900">Liquidity Mining</span>
                <span className="text-primary-600 font-semibold">10%</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mt-8">Supply Mechanics</h3>
          <p className="text-slate-700 leading-relaxed">
            Pesa-Afrik has a flexible supply mechanism designed to maintain price stability. When demand increases, 
            new tokens can be minted through the protocol's treasury. When demand decreases, tokens can be burned 
            to maintain the peg to purchasing power. This elastic supply model is similar to rebase tokens but 
            operates on a longer time horizon (daily rebalancing) to reduce volatility.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8">Revenue Model</h3>
          <p className="text-slate-700 leading-relaxed">
            The protocol generates revenue through transaction fees (0.1% per transaction) and oracle data fees. 
            Revenue is distributed to token stakers and used to build the protocol treasury for future development 
            and ecosystem grants.
          </p>
        </div>
      ),
    },
    'roadmap': {
      title: 'Roadmap',
      content: (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
            <div className="space-y-8">
              <div className="relative pl-10">
                <div className="absolute left-2.5 w-3 h-3 bg-primary-600 rounded-full border-2 border-white" />
                <div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Completed</span>
                  <h4 className="text-lg font-semibold text-slate-900 mt-2">Q4 2023 - Protocol Launch</h4>
                  <p className="text-slate-600 mt-1">Initial deployment, smart contract audit, mainnet launch in Kenya and Nigeria.</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-2.5 w-3 h-3 bg-primary-600 rounded-full border-2 border-white" />
                <div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Completed</span>
                  <h4 className="text-lg font-semibold text-slate-900 mt-2">Q1 2024 - East Africa Expansion</h4>
                  <p className="text-slate-600 mt-1">Launch in Kenya, Tanzania, Uganda, and Ethiopia. Mobile money integration.</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-2.5 w-3 h-3 bg-primary-600 rounded-full border-2 border-white" />
                <div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">In Progress</span>
                  <h4 className="text-lg font-semibold text-slate-900 mt-2">Q1-Q2 2024 - North & West Africa</h4>
                  <p className="text-slate-600 mt-1">Expansion to Egypt, Morocco, Ghana, and Cameroon. Additional currency pairs.</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-2.5 w-3 h-3 bg-slate-300 rounded-full border-2 border-white" />
                <div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Planned</span>
                  <h4 className="text-lg font-semibold text-slate-900 mt-2">Q3 2024 - API & Developer Platform</h4>
                  <p className="text-slate-600 mt-1">Public API release, SDK launches, integration partnerships.</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-2.5 w-3 h-3 bg-slate-300 rounded-full border-2 border-white" />
                <div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Planned</span>
                  <h4 className="text-lg font-semibold text-slate-900 mt-2">Q4 2024 - Governance Launch</h4>
                  <p className="text-slate-600 mt-1">Decentralized governance implementation, community voting on basket composition.</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-2.5 w-3 h-3 bg-slate-300 rounded-full border-2 border-white" />
                <div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Planned</span>
                  <h4 className="text-lg font-semibold text-slate-900 mt-2">2025 - Continental Scale</h4>
                  <p className="text-slate-600 mt-1">Pan-African coverage, central bank partnerships, institutional adoption.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    'team': {
      title: 'Team',
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 leading-relaxed">
            Pesa-Afrik was founded by a diverse team of African technologists, economists, and financial professionals 
            with experience at leading institutions including the African Development Bank, Ethereum Foundation, 
            MTN, and Flutterwave.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[
              { name: 'Dr. Amara Okonkwo', role: 'Founder & CEO', bio: 'Former Chief Economist at African Development Bank. PhD in Development Economics from MIT.' },
              { name: 'Kofi Mensah', role: 'Chief Technology Officer', bio: 'Previously Lead Engineer at Ethereum Foundation. Computer Science PhD from Stanford.' },
              { name: 'Dr. Sarah Chen', role: 'Head of Economics', bio: 'Former Reserve Bank of Kenya advisor. Expertise in monetary policy and financial inclusion.' },
              { name: 'Grace Mwangi', role: 'Head of Operations', bio: 'Former Operations Director at Flutterwave. MBA from Harvard Business School.' },
              { name: 'Abdelrahman Hassan', role: 'Head of Business Development', bio: 'Former Regional Director at World Bank. 15 years experience in African fintech.' },
              { name: 'Dr. Ngozi Okafor', role: 'Head of Compliance', bio: 'Former compliance officer at Standard Chartered. Legal expertise in African financial regulations.' },
            ].map((member, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900">{member.name}</h4>
                <p className="text-sm text-primary-600 mb-3">{member.role}</p>
                <p className="text-sm text-slate-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary-600" />
              Pesa-Afrik Whitepaper
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Technical specification for a decentralized, purchasing-power-parity cryptocurrency protocol for Africa.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-2">
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="pdf">PDF Format</option>
              <option value="epub">ePub Format</option>
              <option value="md">Markdown</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
                Contents
              </p>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setExpandedSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        expandedSection === section.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={expandedSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200"
            >
              <div className="px-8 py-6 border-b border-slate-200">
                <h2 className="text-2xl font-display font-bold text-slate-900">
                  {content[expandedSection]?.title}
                </h2>
              </div>
              <div className="p-8">
                {content[expandedSection]?.content}
              </div>
            </motion.div>

            {/* Version Info */}
            <div className="mt-8 text-center text-sm text-slate-500">
              <p>Version 1.0 | Last Updated: January 2024</p>
              <p className="mt-1">This whitepaper is for informational purposes only and is subject to change.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhitepaperPage;
