import { useState } from 'react';
import { Shield, Eye, Lock, Database, Globe, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const PrivacyPage = () => {
  const [expandedSections, setExpandedSections] = useState({
    'introduction': true,
    'data-collection': false,
    'data-usage': false,
    'data-protection': false,
    'cookies': false,
    'user-rights': false,
    'international': false,
    'updates': false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: Shield,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Pesa-Afrik ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how 
            we collect, use, disclose, and safeguard your information when you use our cryptocurrency platform and services.
          </p>
          <p>
            By accessing or using Pesa-Afrik, you agree to this Privacy Policy and our Terms of Service. If you do not 
            agree with the terms of this policy, please do not access our platform.
          </p>
          <p className="text-sm text-slate-500">
            Last updated: January 2024
          </p>
        </div>
      ),
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      icon: Database,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <h4 className="font-semibold text-slate-900">Personal Information</h4>
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Full legal name and date of birth</li>
            <li>Email address and phone number</li>
            <li>Government-issued identification documents (passport, national ID, driver's license)</li>
            <li>Residential address and proof of address documentation</li>
            <li>Bank account or mobile money account details</li>
            <li>Photographs for identity verification</li>
          </ul>

          <h4 className="font-semibold text-slate-900 mt-6">Financial Information</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>Transaction history and wallet addresses</li>
            <li>Deposit and withdrawal records</li>
            <li>Linked financial accounts and balances</li>
            <li>Credit history and verification data (where applicable)</li>
          </ul>

          <h4 className="font-semibold text-slate-900 mt-6">Technical Information</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address and browser type</li>
            <li>Device information and operating system</li>
            <li>Usage patterns and navigation data</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      icon: Eye,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>We use the collected information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity Verification:</strong> To comply with Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations</li>
            <li><strong>Service Provision:</strong> To process transactions, maintain your account, and provide customer support</li>
            <li><strong>Security:</strong> To detect and prevent fraud, unauthorized activities, and security breaches</li>
            <li><strong>Legal Compliance:</strong> To fulfill regulatory reporting obligations and respond to legal requests</li>
            <li><strong>Platform Improvement:</strong> To analyze usage patterns and improve our services</li>
            <li><strong>Communication:</strong> To send you important updates about your account and our services</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties. We may share data with service providers who 
            assist in our operations, subject to strict confidentiality obligations.
          </p>
        </div>
      ),
    },
    {
      id: 'data-protection',
      title: 'Data Protection Measures',
      icon: Lock,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>We implement industry-standard security measures to protect your information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Encryption:</strong> All sensitive data is encrypted at rest using AES-256 encryption</li>
            <li><strong>Transmission Security:</strong> All data transmitted is protected using TLS 1.3 encryption</li>
            <li><strong>Access Controls:</strong> Role-based access controls limit employee access to necessary data</li>
            <li><strong>Security Audits:</strong> Regular third-party security audits and penetration testing</li>
            <li><strong>Incident Response:</strong> Documented security incident response procedures</li>
            <li><strong>Data Retention:</strong> Secure deletion of data when no longer needed</li>
          </ul>
          <p className="mt-4">
            While we strive to protect your information, no method of transmission or storage is 100% secure. 
            We cannot guarantee absolute security.
          </p>
        </div>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: Globe,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>We use cookies and similar technologies to enhance your experience:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for authentication, session management, and security</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
          </ul>
          <p className="mt-4">
            You can control cookies through your browser settings. Note that disabling certain cookies may affect 
            platform functionality.
          </p>
        </div>
      ),
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      icon: Shield,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>You have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
            <li><strong>Right to Restriction:</strong> Request limitation of data processing in certain circumstances</li>
            <li><strong>Right to Portability:</strong> Request a machine-readable copy of your data</li>
            <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact our Data Protection Officer at dpo@pesa-Afrik.io. We will respond 
            within 30 days.
          </p>
        </div>
      ),
    },
    {
      id: 'international',
      title: 'International Data Transfers',
      icon: Globe,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Pesa-Afrik operates across multiple African jurisdictions and may transfer your data to countries 
            other than your country of residence. These transfers are governed by appropriate safeguards:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Standard Contractual Clauses approved by relevant authorities</li>
            <li>Adequacy decisions where applicable</li>
            <li>Binding Corporate Rules for intra-group transfers</li>
          </ul>
          <p className="mt-4">
            By using our services, you consent to the transfer of your information to these countries in 
            accordance with this Privacy Policy.
          </p>
        </div>
      ),
    },
    {
      id: 'updates',
      title: 'Policy Updates',
      icon: Database,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes 
            by:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Posting the new policy on this page</li>
            <li>Updating the "Last Updated" date</li>
            <li>Sending you an email notification for significant changes</li>
            <li>Displaying a notice on our platform</li>
          </ul>
          <p className="mt-4">
            We encourage you to review this Privacy Policy periodically for any changes.
          </p>
          <h4 className="font-semibold text-slate-900 mt-6">Contact Us</h4>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-primary-600">privacy@pesa-Afrik.io</span>
          </div>
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
            <Shield className="w-8 h-8 text-primary-600" />
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            How we collect, use, and protect your personal information.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {sections.map((section, index) => (
            <div key={section.id} className="border-b border-slate-200 last:border-b-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              {expandedSections[section.id] && (
                <div className="px-6 pb-6 ml-14">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Notice */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This Privacy Policy is effective as of January 2024 and applies to all information collected through our platform.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
