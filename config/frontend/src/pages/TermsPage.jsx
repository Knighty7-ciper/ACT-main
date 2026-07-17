import { useState } from 'react';
import { FileText, Shield, AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

const TermsPage = () => {
  const [expandedSections, setExpandedSections] = useState({
    'acceptance': true,
    'services': false,
    'eligibility': false,
    'account': false,
    'transactions': false,
    'fees': false,
    'risks': false,
    'prohibited': false,
    'liability': false,
    'governing': false,
    'general': false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Welcome to Pesa-Afrik. By accessing or using the Pesa-Afrik cryptocurrency platform, including our website, 
            mobile applications, APIs, and related services (collectively, the "Platform"), you agree to be bound by 
            these Terms of Service ("Terms").
          </p>
          <p>
            If you are using the Platform on behalf of a business or organization, you represent that you have the 
            authority to bind that entity to these Terms, and "you" refers to both you individually and that entity.
          </p>
          <p>
            If you do not agree to these Terms, you may not access or use the Platform. We reserve the right to 
            modify these Terms at any time, and such modifications will be effective upon posting.
          </p>
          <p className="text-sm text-slate-500">
            Last updated: January 2024
          </p>
        </div>
      ),
    },
    {
      id: 'services',
      title: 'Description of Services',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Pesa-Afrik provides the following services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>A cryptocurrency protocol for stable value transfer based on Purchasing Power Parity (PPP)</li>
            <li>Wallet services for storing, sending, and receiving Pesa-Afrik tokens</li>
            <li>Exchange rate information and conversion services</li>
            <li>Basket analysis and stability metrics</li>
            <li>APIs for third-party integrations</li>
            <li>Customer support and educational resources</li>
          </ul>
          <p className="mt-4">
            We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time with 
            reasonable notice, except in cases of emergency.
          </p>
        </div>
      ),
    },
    {
      id: 'eligibility',
      title: 'Eligibility and Restrictions',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <h4 className="font-semibold text-slate-900">Age Requirements</h4>
          <p>
            You must be at least 18 years old and have the legal capacity to enter into contracts to use the Platform.
          </p>

          <h4 className="font-semibold text-slate-900 mt-6">Geographic Restrictions</h4>
          <p>
            The Platform is not available to residents of certain jurisdictions where cryptocurrency services are 
            prohibited or not properly regulated. Currently, we do not provide services to residents of:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Countries subject to comprehensive sanctions (as determined by the UN or your local jurisdiction)</li>
            <li>Regions where our regulatory registrations do not cover operations</li>
          </ul>

          <h4 className="font-semibold text-slate-900 mt-6">Professional Investor Status</h4>
          <p>
            By using the Platform, you represent that you are not a "U.S. person" as defined under Regulation S 
            of the U.S. Securities Act, and that you are accessing the Platform from a permitted jurisdiction.
          </p>
        </div>
      ),
    },
    {
      id: 'account',
      title: 'Account Registration',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <h4 className="font-semibold text-slate-900">Identity Verification</h4>
          <p>
            To use certain features of the Platform, you must complete our identity verification process ("KYC"). 
            This includes providing government-issued identification, proof of address, and other required documents.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">Account Security</h4>
          <p>You are responsible for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
            <li>Enabling two-factor authentication (recommended)</li>
          </ul>

          <h4 className="font-semibold text-slate-900 mt-4">Recovery Phrase</h4>
          <p>
            Upon wallet creation, you will receive a 12-word recovery phrase. This phrase is non-recoverable if lost. 
            We cannot access your funds without your recovery phrase. Store it securely offline.
          </p>
        </div>
      ),
    },
    {
      id: 'transactions',
      title: 'Transactions',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <h4 className="font-semibold text-slate-900">Transaction Processing</h4>
          <p>
            All transactions on the Platform are final and irreversible once confirmed. You are responsible for 
            verifying all transaction details before confirmation, including recipient addresses and amounts.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">Transaction Limits</h4>
          <p>
            We may impose limits on transaction amounts based on your verification level, regulatory requirements, 
            or risk management considerations.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">Blockchain Transactions</h4>
          <p>
            Transactions conducted on the underlying blockchain are recorded on a public ledger. Transaction hashes 
            can be used to verify transaction details on the blockchain explorer.
          </p>
        </div>
      ),
    },
    {
      id: 'fees',
      title: 'Fees and Charges',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>We charge the following fees:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Network Fee:</strong> 0.1% of transaction amount (minimum $0.01)</li>
            <li><strong>Withdrawal Fee:</strong> Standard network fees apply based on blockchain</li>
            <li><strong>Conversion Fee:</strong> Included in the exchange rate spread</li>
          </ul>
          <p className="mt-4">
            Fees are subject to change with 30 days' notice. The applicable fee at the time of transaction will be 
            displayed before confirmation.
          </p>
        </div>
      ),
    },
    {
      id: 'risks',
      title: 'Risk Disclosure',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Important Risk Information</p>
              <p className="text-sm text-amber-700 mt-1">
                Cryptocurrency and digital asset investments carry significant risk.
              </p>
            </div>
          </div>

          <p>By using the Platform, you acknowledge and accept the following risks:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Market Risk:</strong> The value of Pesa-Afrik may fluctuate based on commodity prices and market conditions</li>
            <li><strong>Regulatory Risk:</strong> Changes in laws or regulations may affect the availability or legality of our services</li>
            <li><strong>Technology Risk:</strong> Technical failures, hacking, or smart contract vulnerabilities may result in losses</li>
            <li><strong>Liquidity Risk:</strong> Limited liquidity may affect your ability to buy or sell tokens when desired</li>
            <li><strong>Operational Risk:</strong> Third-party service provider failures may impact Platform operations</li>
          </ul>
          <p className="mt-4">
            You should not invest more than you can afford to lose and should seek independent financial advice 
            before making investment decisions.
          </p>
        </div>
      ),
    },
    {
      id: 'prohibited',
      title: 'Prohibited Activities',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>You agree not to use the Platform for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Any illegal activity under the laws of your jurisdiction or international law</li>
            <li>Money laundering, terrorist financing, or other financial crimes</li>
            <li>Fraud, misrepresentation, or deceptive practices</li>
            <li>Market manipulation or insider trading</li>
            <li>Attacking or attempting to gain unauthorized access to our systems</li>
            <li>Using the Platform to facilitate prohibited activities by third parties</li>
            <li>Violating sanctions or export control regulations</li>
          </ul>
          <p className="mt-4">
            Violation of these terms may result in account termination, forfeiture of funds, and referral to 
            law enforcement authorities.
          </p>
        </div>
      ),
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <h4 className="font-semibold text-slate-900">Disclaimer of Warranties</h4>
          <p>
            THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
            OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">Limitation of Damages</h4>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PESA-AFRIK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING 
            OUT OF OR RELATED TO YOUR USE OF THE PLATFORM.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">Indemnification</h4>
          <p>
            You agree to indemnify and hold harmless Pesa-Afrik, its affiliates, officers, directors, and employees 
            from any claims, damages, losses, or expenses arising from your breach of these Terms or your violation 
            of any law or third-party right.
          </p>
        </div>
      ),
    },
    {
      id: 'governing',
      title: 'Governing Law and Disputes',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <h4 className="font-semibold text-slate-900">Governing Law</h4>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Mauritius, without regard 
            to conflict of law principles.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">Dispute Resolution</h4>
          <p>
            Any dispute arising out of or relating to these Terms or the Platform shall first be submitted to 
            good-faith negotiations between the parties. If negotiations fail, disputes shall be resolved through 
            binding arbitration administered by the Mauritius International Arbitration Centre.
          </p>

          <h4 className="font-semibold text-slate-900 mt-4">Class Action Waiver</h4>
          <p>
            You agree not to participate in class action lawsuits or class-wide arbitrations against Pesa-Afrik. 
            Claims must be brought in your individual capacity.
          </p>
        </div>
      ),
    },
    {
      id: 'general',
      title: 'General Provisions',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <ul className="list-decimal pl-6 space-y-2">
            <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Pesa-Afrik regarding the Platform.</li>
            <li><strong>Severability:</strong> If any provision of these Terms is found unenforceable, the remaining provisions will remain in effect.</li>
            <li><strong>Waiver:</strong> Failure to enforce any right under these Terms does not constitute a waiver of that right.</li>
            <li><strong>Assignment:</strong> You may not assign these Terms without our prior written consent. We may assign our rights and obligations freely.</li>
            <li><strong>Notices:</strong> All notices shall be sent to the email address associated with your account.</li>
          </ul>

          <h4 className="font-semibold text-slate-900 mt-6">Contact Information</h4>
          <p>For questions about these Terms, please contact us at:</p>
          <p className="text-primary-600">legal@pesa-Afrik.io</p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Legal terms governing your use of the Pesa-Afrik platform.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8 flex items-start gap-4">
          <Shield className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary-900 mb-2">Please Read Carefully</h3>
            <p className="text-sm text-primary-800">
              By creating an account or using Pesa-Afrik, you acknowledge that you have read, understood, and 
              agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {sections.map((section) => (
            <div key={section.id} className="border-b border-slate-200 last:border-b-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                {expandedSections[section.id] ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              {expandedSections[section.id] && (
                <div className="px-6 pb-6">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Agreement Box */}
        <div className="mt-8 bg-slate-900 rounded-xl p-6 text-white text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Agreement to Terms</h3>
          <p className="text-slate-300 max-w-lg mx-auto">
            By using Pesa-Afrik, you confirm that you have read, understood, and agree to be bound by these 
            Terms of Service and all related policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
