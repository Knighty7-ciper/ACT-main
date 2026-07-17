import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SwapPage from './pages/SwapPage';
import ChartsPage from './pages/ChartsPage';
import StabilityPage from './pages/StabilityPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import DocumentationPage from './pages/DocumentationPage';
import WhitepaperPage from './pages/WhitepaperPage';
import ApiPage from './pages/ApiPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiePage from './pages/CookiePage';
import BlogPostPage from './pages/BlogPostPage';

// Footer Pages
import ExchangePage from './pages/ExchangePage';
import EarnPage from './pages/EarnPage';
import WalletPage from './pages/WalletPage';
import LearnPage from './pages/LearnPage';
import HelpPage from './pages/HelpPage';
import SupportPage from './pages/SupportPage';
import DisclaimerPage from './pages/DisclaimerPage';

// Context
import { AuthProvider } from './context/AuthContext';

// Styles
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/stability" element={<StabilityPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Footer Links - Products */}
            <Route path="/exchange" element={<ExchangePage />} />
            <Route path="/earn" element={<EarnPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/api" element={<ApiPage />} />
            
            {/* Footer Links - Support */}
            <Route path="/help" element={<HelpPage />} />
            <Route path="/support" element={<SupportPage />} />
            
            {/* Footer Links - Company */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            
            {/* Footer Links - Resources */}
            <Route path="/whitepaper" element={<WhitepaperPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            
            {/* Footer Links - Legal */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiePage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
