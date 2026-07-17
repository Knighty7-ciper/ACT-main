import { Link } from 'react-router-dom';
import { ArrowLeft, Megaphone, FileText, ExternalLink, Calendar, Building2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PressPage = () => {
  const pressReleases = [
    { date: 'January 15, 2026', title: 'Pesa-Afrik Launches in 5 New African Markets', category: 'Company News' },
    { date: 'December 20, 2025', title: 'Partnership Announcement with African Payment Systems', category: 'Partnership' },
    { date: 'November 15, 2025', title: 'Pesa-Afrik Reaches 100,000 Active Users', category: 'Milestone' },
    { date: 'October 1, 2025', title: 'Smart Contract Audit Completed by CertiK', category: 'Security' },
  ];

  const mediaCoverage = [
    { outlet: 'TechCrunch', title: 'Pesa-Afrik Bringing Financial Sovereignty to Africa', date: 'January 2026' },
    { outlet: 'CoinDesk', title: 'PPP-Based Stablecoins Gain Traction in Emerging Markets', date: 'December 2025' },
    { outlet: 'Bloomberg', title: 'African Crypto Innovation: Pesa-Afrik Case Study', date: 'November 2025' },
    { outlet: 'Forbes', title: 'Top 10 African Fintech Startups to Watch', date: 'October 2025' },
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Press & Media</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Latest news, press releases, and media coverage about Pesa-Afrik.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Press Releases</h2>
          <div className="space-y-4 mb-12">
            {pressReleases.map((pr, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{pr.date}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">{pr.category}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{pr.title}</h3>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">Media Coverage</h2>
          <div className="space-y-4">
            {mediaCoverage.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">{item.outlet}</div>
                  <div className="text-slate-600 text-sm">{item.title}</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{item.date}</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center">
            <Megaphone className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Media Inquiries</h3>
            <p className="text-slate-300 mb-4">For press and media inquiries, please contact our PR team</p>
            <a href="mailto:press@pesaafrik.com" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
              Contact PR Team
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PressPage;
