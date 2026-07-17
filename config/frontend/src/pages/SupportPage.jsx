import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SupportPage = () => {
  const contactOptions = [
    { icon: <MessageCircle className="w-8 h-8" />, title: 'Live Chat', desc: 'Chat with our support team instantly', time: 'Average response: 2 minutes' },
    { icon: <Mail className="w-8 h-8" />, title: 'Email Support', desc: 'Send us a detailed message', time: 'Average response: 4 hours' },
    { icon: <Clock className="w-8 h-8" />, title: '24/7 Availability', desc: 'We\'re always here to help', time: 'Round the clock support' },
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Submit a Request</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Our support team is here to help. Choose the best way to reach us.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactOptions.map((opt) => (
              <div key={opt.title} className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  {opt.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{opt.title}</h3>
                <p className="text-slate-600 text-sm mb-2">{opt.desc}</p>
                <p className="text-emerald-600 text-sm font-medium">{opt.time}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input type="text" placeholder="Your name" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>General Inquiry</option>
                  <option>Wallet Issue</option>
                  <option>Transaction Problem</option>
                  <option>Staking Question</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea rows="5" placeholder="Describe your issue or question..." className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
              </div>
              <button type="submit" className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
                Send Message
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SupportPage;
