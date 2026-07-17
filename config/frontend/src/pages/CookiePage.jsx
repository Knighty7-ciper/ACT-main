import { useState } from 'react';
import { Cookie, ChevronDown, ChevronUp, Settings, Shield, Eye, Clock } from 'lucide-react';

const CookiePage = () => {
  const [expandedSections, setExpandedSections] = useState({
    'overview': true,
    'essential': false,
    'analytics': false,
    'marketing': false,
    'managing': false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: 'overview',
      title: 'Cookie Policy Overview',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Pesa-Afrik ("we," "our," or "us") uses cookies and similar tracking technologies to enhance your 
            experience on our platform. This Cookie Policy explains what cookies are, how we use them, and your 
            choices regarding their use.
          </p>
          <p>
            Cookies are small text files stored on your device when you visit websites. They help the site 
            function properly and provide information to site owners about how visitors use the site.
          </p>
          <p className="text-sm text-slate-500">
            Last updated: January 2024
          </p>
        </div>
      ),
    },
    {
      id: 'essential',
      title: 'Essential Cookies',
      icon: Shield,
      description: 'Required for the platform to function properly',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Essential cookies are necessary for the Platform to function and cannot be disabled. They are 
            usually set in response to your actions like setting privacy preferences, logging in, or filling forms.
          </p>
          <div className="bg-slate-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cookie Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">session_id</td>
                  <td className="px-4 py-3">Maintain your logged-in session</td>
                  <td className="px-4 py-3">Session</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">auth_token</td>
                  <td className="px-4 py-3">Authentication verification</td>
                  <td className="px-4 py-3">30 days</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">preferences</td>
                  <td className="px-4 py-3">Remember your UI preferences</td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">security</td>
                  <td className="px-4 py-3">Security checks and fraud prevention</td>
                  <td className="px-4 py-3">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-slate-700">csrf_token</td>
                  <td className="px-4 py-3">Protect against cross-site request forgery</td>
                  <td className="px-4 py-3">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      icon: Eye,
      description: 'Help us understand how you use our platform',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Analytics cookies help us understand how visitors interact with our Platform by collecting and 
            reporting information anonymously. This helps us improve site performance and user experience.
          </p>
          <div className="bg-slate-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cookie Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">_ga</td>
                  <td className="px-4 py-3">Distinguish users (Google Analytics)</td>
                  <td className="px-4 py-3">2 years</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">_gid</td>
                  <td className="px-4 py-3">Distinguish users (Google Analytics)</td>
                  <td className="px-4 py-3">24 hours</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">_gat</td>
                  <td className="px-4 py-3">Throttle request rate (Google Analytics)</td>
                  <td className="px-4 py-3">1 minute</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-slate-700">amplitude</td>
                  <td className="px-4 py-3">Product analytics and user behavior tracking</td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            The data collected through analytics cookies is anonymized and cannot be used to identify you personally.
          </p>
        </div>
      ),
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      icon: Cookie,
      description: 'Used to deliver relevant advertisements',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Marketing cookies are used to track visitors across websites to display ads that are relevant and 
            engaging for you. These cookies may be set by our advertising partners to build a profile of your 
            interests.
          </p>
          <div className="bg-slate-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cookie Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">fbp</td>
                  <td className="px-4 py-3">Facebook advertising tracking</td>
                  <td className="px-4 py-3">90 days</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">ads</td>
                  <td className="px-4 py-3">Google Ads conversion tracking</td>
                  <td className="px-4 py-3">30 days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-slate-700">personalization</td>
                  <td className="px-4 py-3">Content and ad personalization</td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Eye className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Marketing cookies require consent</p>
              <p className="text-sm text-amber-700 mt-1">
                These cookies are only set after you have given your explicit consent for marketing tracking.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'managing',
      title: 'Managing Your Cookie Preferences',
      icon: Settings,
      description: 'Control which cookies are used on your device',
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>You have several options for managing cookie preferences:</p>
          
          <h4 className="font-semibold text-slate-900 mt-4">Browser Settings</h4>
          <p>Most browsers allow you to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>View cookies stored on your device</li>
            <li>Delete all or specific cookies</li>
            <li>Block cookies from all or specific websites</li>
            <li>Set preferences for first-party and third-party cookies</li>
          </ul>

          <h4 className="font-semibold text-slate-900 mt-6">How to Manage Cookies in Popular Browsers</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-medium text-slate-900 mb-2">Google Chrome</h5>
              <p className="text-sm text-slate-600">
                Settings &gt; Privacy and Security &gt; Cookies and other site data
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-medium text-slate-900 mb-2">Mozilla Firefox</h5>
              <p className="text-sm text-slate-600">
                Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-medium text-slate-900 mb-2">Safari</h5>
              <p className="text-sm text-slate-600">
                Preferences &gt; Privacy &gt; Cookies and website data
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-medium text-slate-900 mb-2">Microsoft Edge</h5>
              <p className="text-sm text-slate-600">
                Settings &gt; Cookies and Site Permissions &gt; Manage and delete cookies
              </p>
            </div>
          </div>

          <h4 className="font-semibold text-slate-900 mt-6">Platform Cookie Settings</h4>
          <p>
            You can also manage your cookie preferences directly on our Platform through the cookie consent 
            banner that appears when you first visit. Your preferences are stored and can be updated at any time.
          </p>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-primary-900 mb-2">Important Note</h4>
            <p className="text-sm text-primary-800">
              Blocking or deleting essential cookies may prevent you from using certain features of the Platform, 
              including logging in, making transactions, or accessing your wallet. Analytics and marketing cookies 
              can be safely disabled without affecting core functionality.
            </p>
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
            <Cookie className="w-8 h-8 text-primary-600" />
            Cookie Policy
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            How we use cookies and similar technologies on the Pesa-Afrik platform.
          </p>
        </div>

        {/* Quick Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">Essential</h3>
            </div>
            <p className="text-sm text-slate-600">Required for platform functionality. Cannot be disabled.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-slate-900">Analytics</h3>
            </div>
            <p className="text-sm text-slate-600">Help us improve our services. Can be disabled.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Cookie className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-slate-900">Marketing</h3>
            </div>
            <p className="text-sm text-slate-600">Used for relevant ads. Requires your consent.</p>
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
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                    {section.description && (
                      <p className="text-sm text-slate-500">{section.description}</p>
                    )}
                  </div>
                </div>
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

        {/* Contact */}
        <div className="mt-8 bg-slate-900 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">Questions About Cookies?</h3>
          <p className="text-slate-300 mb-4">
            If you have questions about our use of cookies, please contact our privacy team.
          </p>
          <a href="mailto:privacy@pesa-Afrik.io" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors">
            Contact Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookiePage;
