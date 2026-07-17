import { Link } from 'react-router-dom';
import { ArrowLeft, Palette, ShoppingBag, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NFTPage = () => {
  const collections = [
    { name: 'African Art', items: 1250, floor: '50 PESA', volume: '4,500 PESA' },
    { name: 'Cultural Heritage', items: 890, floor: '25 PESA', volume: '2,100 PESA' },
    { name: 'Wildlife Series', items: 500, floor: '100 PESA', volume: '8,200 PESA' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Pesa-Afrik <span className="text-purple-400">NFT</span> Marketplace
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mb-8">
            Discover, collect, and sell African-inspired NFTs. Support artists and preserve culture.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/nft/marketplace" className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
              Explore Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/nft/create" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">
              Create NFT
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((col) => (
              <div key={col.name} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
                <div className="h-40 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                  <Palette className="w-16 h-16 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{col.name}</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{col.items} items</span>
                  <span className="text-slate-900">Floor: {col.floor}</span>
                </div>
                <div className="mt-2 text-sm text-purple-600">Volume: {col.volume}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">African Artists, Global Stage</h2>
          <p className="text-purple-100 mb-8">Mint and sell NFTs with low fees. Fast settlement. Global audience.</p>
          <Link to="/nft/create" className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition-colors">
            Start Creating
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NFTPage;
