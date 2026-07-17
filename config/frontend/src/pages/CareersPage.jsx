import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Heart, Globe, Zap, Shield, ChevronRight, CheckCircle, ArrowRight, Mail } from 'lucide-react';

const CareersPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedDepartment, setExpandedDepartment] = useState(null);

  const openPositions = [
    {
      department: 'Engineering',
      positions: [
        {
          title: 'Senior Backend Engineer',
          location: 'Remote / Nairobi, Kenya',
          type: 'Full-time',
          description: 'Lead the development of our core blockchain infrastructure and API services.',
          requirements: ['5+ years experience with distributed systems', 'Experience with blockchain or fintech platforms', 'Node.js, Python, or Go proficiency'],
        },
        {
          title: 'Frontend Developer (React)',
          location: 'Remote',
          type: 'Full-time',
          description: 'Build beautiful, performant user interfaces for our dashboard and analytics tools.',
          requirements: ['3+ years React experience', 'TypeScript and modern CSS expertise', 'Experience with data visualization libraries'],
        },
        {
          title: 'Smart Contract Developer',
          location: 'Remote / Lagos, Nigeria',
          type: 'Full-time',
          description: 'Develop and audit smart contracts for the Pesa-Afrik token ecosystem.',
          requirements: ['Solidity development experience', 'Security auditing experience', 'Understanding of DeFi protocols'],
        },
      ],
    },
    {
      department: 'Product',
      positions: [
        {
          title: 'Product Manager',
          location: 'Nairobi, Kenya',
          type: 'Full-time',
          description: 'Lead product strategy for our consumer and enterprise offerings across Africa.',
          requirements: ['5+ years product management in fintech', 'Experience with crypto or blockchain products', 'Strong analytical and communication skills'],
        },
      ],
    },
    {
      department: 'Operations',
      positions: [
        {
          title: 'Regional Operations Manager - West Africa',
          location: 'Lagos, Nigeria',
          type: 'Full-time',
          description: 'Drive our expansion and partnership efforts across West African markets.',
          requirements: ['7+ years in operations or business development', 'Strong network in African fintech', 'Fluent in English and at least one West African language'],
        },
        {
          title: 'Compliance Officer',
          location: 'Mauritius',
          type: 'Full-time',
          description: 'Ensure regulatory compliance across all jurisdictions where Pesa-Afrik operates.',
          requirements: ['Experience in financial services compliance', 'Knowledge of AML/KYC regulations', 'Experience with crypto regulatory frameworks'],
        },
      ],
    },
    {
      department: 'Data & Economics',
      positions: [
        {
          title: 'Data Scientist',
          location: 'Remote',
          type: 'Full-time',
          description: 'Build models to improve our PPP algorithm and price prediction systems.',
          requirements: ['MSc or PhD in Statistics, Economics, or related field', 'Experience with time series analysis', 'Python and SQL proficiency'],
        },
      ],
    },
  ];

  const values = [
    {
      icon: Globe,
      title: 'Ubuntu',
      description: 'We believe in the African philosophy of shared humanity. Our success is tied to the communities we serve.',
    },
    {
      icon: Shield,
      title: 'Transparency',
      description: 'Open source code, public ledgers, and auditable algorithms. Trust is earned through verification.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Solving African problems with world-class technology. We innovate for impact, not hype.',
    },
    {
      icon: Users,
      title: 'Inclusion',
      description: 'Building financial infrastructure for all Africans, regardless of location, income, or background.',
    },
  ];

  const benefits = [
    'Competitive salary and token-based compensation',
    'Equity in a growing Pan-African company',
    'Remote-first work culture',
    'Health insurance coverage',
    'Professional development budget',
    'Generous vacation and parental leave',
    'Annual company retreats',
    'Equipment and home office stipend',
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">
            Join the Mission
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We're building the financial infrastructure that will unite Africa. Help us create a continent where value flows freely, borders don't matter, and everyone has access to stable, transparent money.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-xl border border-slate-200 p-1">
            {['overview', 'positions', 'benefits'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Mission Statement */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 mb-8">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-6">
                  Building Africa's Financial Future
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  Pesa-Afrik was born from a simple question: Why should Africans pay the price of currency instability? 
                  Our team spans 12 countries, bringing together expertise from fintech, blockchain, economics, and 
                  community organizing. We're united by a belief that technology can democratize access to stable value.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary-600 mb-2">45+</p>
                    <p className="text-sm text-slate-600">Team Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary-600 mb-2">12</p>
                    <p className="text-sm text-slate-600">Countries Represented</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary-600 mb-2">2023</p>
                    <p className="text-sm text-slate-600">Founded</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="mb-12">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-8 text-center">
                Our Values
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 p-6"
                  >
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setActiveTab('positions')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Briefcase className="w-5 h-5" />
                View Open Positions
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">
                Open Positions
              </h2>
              <p className="text-slate-600">
                We're always looking for talented individuals who share our mission. Below are our current openings.
              </p>
            </div>

            <div className="space-y-4">
              {openPositions.map((dept) => (
                <div key={dept.department} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedDepartment(expandedDepartment === dept.department ? null : dept.department)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Briefcase className="w-5 h-5 text-primary-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900">{dept.department}</h3>
                        <p className="text-sm text-slate-500">{dept.positions.length} open position{dept.positions.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedDepartment === dept.department ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedDepartment === dept.department && (
                    <div className="border-t border-slate-200">
                      {dept.positions.map((position, idx) => (
                        <div
                          key={idx}
                          className="px-6 py-6 border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-slate-900">{position.title}</h4>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                  {position.type}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                {position.location}
                              </p>
                              <p className="text-slate-600 mb-4">{position.description}</p>
                              <div className="space-y-2">
                                {position.requirements.map((req, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-600">{req}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap">
                              Apply Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* No Open Positions in Your Field */}
            <div className="mt-8 bg-slate-100 rounded-xl p-6 text-center">
              <p className="text-slate-600 mb-4">
                Don't see a role that fits your skills? We're always interested in hearing from exceptional candidates.
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors">
                <Mail className="w-4 h-4" />
                Send us your resume
              </button>
            </div>
          </motion.div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">
                Benefits & Perks
              </h2>
              <p className="text-slate-600">
                We take care of our team so you can focus on building the future of African finance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-primary-600" />
                  Health & Wellness
                </h3>
                <ul className="space-y-3">
                  {benefits.slice(0, 4).map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary-600" />
                  Growth & Development
                </h3>
                <ul className="space-y-3">
                  {benefits.slice(4).map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Additional Perks */}
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Additional Perks</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="font-medium text-slate-900 mb-1">Remote-First</h4>
                  <p className="text-sm text-slate-600">Work from anywhere. We hire the best, regardless of location.</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="font-medium text-slate-900 mb-1">Team Retreats</h4>
                  <p className="text-sm text-slate-600">Annual company gatherings to connect and collaborate.</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="font-medium text-slate-900 mb-1">Equipment</h4>
                  <p className="text-sm text-slate-600">Top-tier laptop and home office setup allowance.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CareersPage;
