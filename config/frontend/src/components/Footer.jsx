import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Github,
  Twitter,
  Linkedin,
  MessageCircle,
  Globe,
  ChevronDown,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Mail,
  Shield,
  FileText,
  Clock,
  HelpCircle,
  CreditCard,
  BookOpen,
  Building2,
  GraduationCap,
  ArrowUp
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState(null);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const footerLinks = {
    products: {
      title: 'Products',
      links: [
        { label: 'Exchange', path: '/exchange' },
        { label: 'Earn', path: '/earn' },
        { label: 'Wallet', path: '/wallet' },
        { label: 'Learn', path: '/learn' },
        { label: 'API', path: '/api' },
      ]
    },
    support: {
      title: 'Support',
      links: [
        { label: 'Help Center', path: '/help' },
        { label: 'Submit a Request', path: '/support' },
      ]
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Blog', path: '/blog' },
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { label: 'Whitepaper', path: '/whitepaper' },
      ]
    },
    community: {
      title: 'Community',
      links: [
        { label: 'Twitter', href: 'https://twitter.com/pesaafrik', external: true },
        { label: 'Telegram', href: 'https://t.me/pesaafrik', external: true },
        { label: 'Discord', href: 'https://discord.gg/pesaafrik', external: true },
        { label: 'LinkedIn', href: 'https://linkedin.com/company/pesaafrik', external: true },
        { label: 'GitHub', href: 'https://github.com/pesaafrik', external: true },
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Cookie Policy', path: '/cookies' },
        { label: 'Disclaimer', path: '/disclaimer' },
      ]
    }
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/pesaafrik', label: 'Twitter' },
    { icon: MessageCircle, href: 'https://t.me/pesaafrik', label: 'Telegram' },
    { icon: Github, href: 'https://github.com/pesaafrik', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/pesaafrik', label: 'LinkedIn' },
  ];

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const FooterColumn = ({ title, links, sectionKey }) => {
    const isOpen = openSection === sectionKey;
    return (
      <div className="md:border-t-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between py-4 md:p-0"
        >
          <h3
            className="font-semibold text-sm tracking-wide"
            style={{
              color: 'var(--ivory)',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '11px',
            }}
          >
            {title}
          </h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform md:hidden ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'rgba(247, 244, 239, 0.4)' }}
          />
        </button>
        <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="space-y-2 md:space-y-3 pb-4 md:pb-0 mt-2 md:mt-4">
            {links.map((link) => (
              <li key={link.path || link.href}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-1 transition-colors"
                    style={{ color: 'rgba(247, 244, 239, 0.55)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-lt)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 244, 239, 0.55)')}
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ) : (
                  <Link
                    to={link.path}
                    className="text-sm block transition-colors"
                    style={{ color: 'rgba(247, 244, 239, 0.55)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-lt)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 244, 239, 0.55)')}
                    onClick={scrollToTop}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <footer
      className="text-slate-900 safe-area-bottom"
      style={{
        background: 'var(--forest)',
        color: 'var(--ivory)',
        borderTop: '1px solid rgba(201, 168, 76, 0.2)',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          opacity: 0.3,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5" onClick={scrollToTop}>
              <img
                src="/images/pesa-afrik-logo.jpeg"
                alt="Pesa Africa Logo"
                className="h-10 w-auto object-contain rounded-lg"
              />
              <span
                className="font-display font-semibold text-2xl"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: 'var(--ivory)',
                  letterSpacing: '-0.01em',
                }}
              >
                Pesa<span style={{ color: 'var(--gold-lt)', fontStyle: 'italic' }}> Africa</span>
              </span>
            </Link>
            <p
              className="mb-6 max-w-sm text-sm leading-relaxed"
              style={{ color: 'rgba(247, 244, 239, 0.6)' }}
            >
              A decentralized currency anchored to real-world purchasing power across Africa.
              Financial sovereignty without banks.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(247, 244, 239, 0.05)',
                    border: '1px solid rgba(247, 244, 239, 0.1)',
                    color: 'rgba(247, 244, 239, 0.7)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--gold)';
                    e.currentTarget.style.color = 'var(--charcoal)';
                    e.currentTarget.style.borderColor = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(247, 244, 239, 0.05)';
                    e.currentTarget.style.color = 'rgba(247, 244, 239, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(247, 244, 239, 0.1)';
                  }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <FooterColumn title={footerLinks.products.title} links={footerLinks.products.links} sectionKey="products" />
          <FooterColumn title={footerLinks.support.title} links={footerLinks.support.links} sectionKey="support" />
          <FooterColumn title={footerLinks.company.title} links={footerLinks.company.links} sectionKey="company" />
          <FooterColumn title={footerLinks.resources.title} links={footerLinks.resources.links} sectionKey="resources" />
          <FooterColumn title={footerLinks.community.title} links={footerLinks.community.links} sectionKey="community" />
          <FooterColumn title={footerLinks.legal.title} links={footerLinks.legal.links} sectionKey="legal" />
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-lg shadow-lg transition-all z-50"
          style={{
            background: 'var(--gold)',
            color: 'var(--charcoal)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold-lt)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Bottom Section */}
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(247, 244, 239, 0.1)' }}
        >
          <div className="text-sm text-center md:text-left" style={{ color: 'rgba(247, 244, 239, 0.5)' }}>
            <p>© {currentYear} Pesa Africa. All rights reserved.</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(247, 244, 239, 0.35)' }}>
              Cryptocurrency investments are subject to market risks. Please invest responsibly.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-4 text-sm">
            <div className="relative">
              <select
                className="appearance-none px-4 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none transition-colors"
                style={{
                  background: 'rgba(247, 244, 239, 0.05)',
                  border: '1px solid rgba(247, 244, 239, 0.15)',
                  color: 'var(--ivory)',
                }}
              >
                <option>English</option>
                <option>Français</option>
                <option>Español</option>
                <option>Português</option>
                <option>العربية</option>
              </select>
              <Globe
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'rgba(247, 244, 239, 0.4)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
