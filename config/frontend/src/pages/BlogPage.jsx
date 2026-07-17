import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Clock,
  Calendar,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// NewsData.io API - using /latest endpoint as specified
// Use a hardcoded fallback if env variable is not available
const NEWS_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_NEWS_API_KEY) || 'pub_32ad5529c94644bd84d27c9f0a69dc59';
const API_BASE_URL = 'https://newsdata.io/api/1/latest';

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const categories = [
    { name: 'All', id: 'all' },
    { name: 'Breaking', id: 'breaking' },
    { name: 'Business', id: 'business' },
    { name: 'Education', id: 'education' },
    { name: 'Entertainment', id: 'entertainment' },
    { name: 'Environment', id: 'environment' }
  ];

  // Fetch news from NewsData.io using /latest endpoint
  const fetchNews = async (category = '') => {
    setLoading(true);
    setError(null);

    try {
      // Simple fetch - using the format provided by user
      const apiUrl = `${API_BASE_URL}?apikey=${NEWS_API_KEY}`;

      // Direct fetch
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message || 'Failed to fetch news');
      }

      if (data.results && data.results.length > 0) {
        setNewsData(data.results);
        setRetryCount(0); // Reset retry count on success
      } else {
        setNewsData([]);
        setError('No news articles available at the moment.');
      }

    } catch (err) {
      setError(err.message || 'Failed to load news. Please try again.');
      setNewsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory === 'All' ? 'all' : activeCategory.toLowerCase());
  }, [activeCategory, retryCount]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCategoryChange = (categoryName) => {
    setActiveCategory(categoryName);
  };

  // Loading state
  if (loading && newsData.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Loading news...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state - show error message with retry option
  if (error && newsData.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">News</h1>

          {/* Error Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Unable to Load News</h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <button
                  onClick={() => setRetryCount(prev => prev + 1)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Page Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-slate-900">News</h1>
          <p className="text-slate-500 mt-1">Latest cryptocurrency and blockchain news from around the world</p>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 -mx-4 px-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.name
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area - 3 columns */}
          <div className="lg:col-span-3">
            
            {/* News List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-32 h-24 bg-slate-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : newsData.length > 0 ? (
              <div className="space-y-0">
                {newsData.map((article, index) => (
                  <article 
                    key={article.article_id || index}
                    className="flex gap-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors -mx-4 px-4 rounded-lg"
                  >
                    {/* Image */}
                    <div className="flex-shrink-0 w-32 h-24 md:w-40 md:h-28">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
                          <span className="text-slate-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Source and Date */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-emerald-600">
                          {article.source_id || 'News Source'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {article.pubDate ? formatDate(article.pubDate) : ''}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2 leading-snug">
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-600 transition-colors"
                        >
                          {article.title}
                        </a>
                      </h2>
                      
                      {/* Description */}
                      {article.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                          {article.description}
                        </p>
                      )}
                      
                      {/* Keywords */}
                      {article.keywords && article.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.keywords.slice(0, 3).map((keyword, i) => (
                            <span 
                              key={i}
                              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">No news articles found</p>
                <button 
                  onClick={() => fetchNews(activeCategory === 'All' ? 'all' : activeCategory.toLowerCase())}
                  className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            )}

            {/* Load More */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => fetchNews(activeCategory === 'All' ? 'all' : activeCategory.toLowerCase())}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Load More News
              </button>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* Trending */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                Trending
              </h3>
              <div className="space-y-4">
                {newsData.slice(0, 5).map((article, index) => (
                  <a
                    key={article.article_id || index}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 group"
                  >
                    <span className="text-2xl font-bold text-slate-200 group-hover:text-emerald-500 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {article.source_id}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                      activeCategory === category.name 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{category.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                Follow Us
              </h3>
              <div className="flex gap-2">
                <a
                  href="https://twitter.com/pesaafrik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-slate-100 text-slate-700 text-center rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="https://t.me/pesaafrik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-slate-100 text-slate-700 text-center rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Telegram
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
