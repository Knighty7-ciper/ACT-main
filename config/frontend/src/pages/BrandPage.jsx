import { Link } from 'react-router-dom';
import { ArrowLeft, Palette, Download, CheckCircle, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BrandPage = () => {
  const assets = [
    { name: 'Logo - Full Color', formats: ['SVG', 'PNG', 'EPS'], size: 'Vector & Raster' },
    { name: 'Logo - White', formats: ['SVG', 'PNG'], size: 'Transparent' },
    { name: 'Logo - Black', formats: ['SVG', 'PNG'], size: 'Transparent' },
    { name: 'Symbol Only', formats: ['SVG', 'PNG'], size: 'Icon version' },
    { name: 'Wordmark', formats: ['SVG', 'PNG'], size: 'Horizontal' },
  ];

  const colors = [
    { name: 'Primary Emerald', hex: '#10B981', rgb: '16, 185, 129' },
    { name: 'Dark Slate', hex: '#0F172A', rgb: '15, 23, 42' },
    { name: 'Light Slate', hex: '#F8FAFC', rgb: '248, 250, 252' },
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Brand Assets</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Official Pesa-Afrik logos, colors, and guidelines for proper usage.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Logo Files</h2>
          <div className="space-y-4 mb-12">
            {assets.map((asset) => (
              <div key={asset.name} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{asset.name}</h3>
                    <p className="text-slate-600 text-sm mb-2">{asset.size}</p>
                    <div className="flex gap-2">
                      {asset.formats.map((f) => (
                        <span key={f} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {colors.map((color) => (
              <div key={color.name} className="rounded-xl overflow-hidden border border-slate-200">
                <div className="h-24" style={{ backgroundColor: color.hex }}></div>
                <div className="p-4 bg-slate-50">
                  <h3 className="font-semibold text-slate-900">{color.name}</h3>
                  <p className="text-sm text-slate-600">{color.hex}</p>
                  <p className="text-xs text-slate-500">{color.rgb}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Brand Guidelines</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Use the full-color logo on light backgrounds</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Use the white logo on dark backgrounds</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Maintain clear space around the logo</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Do not stretch or distort the logo</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Do not add effects or shadows</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrandPage;
