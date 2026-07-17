import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/charts', label: 'Charts' },
    { path: '/stability', label: 'Stability' },
    { path: '/about', label: 'About' },
    { path: '/blog', label: 'Blog' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md safe-area-top"
      style={{
        background: 'rgba(247, 244, 239, 0.92)',
        borderBottom: '1px solid var(--stone)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo + Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <img
              src="/images/pesa-afrik-logo.jpeg"
              alt="Pesa Africa Logo"
              className="h-8 w-8 sm:h-9 object-contain rounded-md"
            />
            <span
              className="font-display font-semibold text-xl sm:text-2xl hidden xs:inline"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: 'var(--forest)',
                letterSpacing: '-0.01em',
              }}
            >
              Pesa<span style={{ color: 'var(--gold)', fontStyle: 'italic' }}> Africa</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium transition-colors relative"
                style={{
                  color: isActive(link.path) ? 'var(--forest)' : 'var(--mist)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sage)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isActive(link.path) ? 'var(--forest)' : 'var(--mist)')
                }
              >
                {link.label}
                {isActive(link.path) && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: 'var(--gold)' }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                  style={{
                    background: 'var(--ivory)',
                    border: '1px solid var(--stone)',
                  }}
                >
                  <Wallet className="w-4 h-4" style={{ color: 'var(--forest)' }} />
                  <span
                    className="font-medium text-sm hidden sm:inline"
                    style={{ color: 'var(--ink)' }}
                  >
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--mist)' }}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-2 z-50"
                      style={{
                        background: '#fff',
                        border: '1px solid var(--stone)',
                      }}
                    >
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2.5 text-sm hover:bg-ivory"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'var(--ivory)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 text-sm"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'var(--ivory)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/swap"
                        className="block px-4 py-2.5 text-sm"
                        style={{ color: 'var(--ink)' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'var(--ivory)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Swap
                      </Link>
                      <hr style={{ borderColor: 'var(--stone)' }} className="my-2" />
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm"
                        style={{ color: '#991B1B' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium hidden sm:block transition-colors"
                  style={{ color: 'var(--mist)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--forest)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--mist)')}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--charcoal)',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold-lt)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg -mr-2"
            style={{ color: 'var(--forest)' }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid var(--stone)' }}
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-base font-medium transition-colors"
                    style={{
                      background: isActive(link.path) ? 'var(--ivory)' : 'transparent',
                      color: isActive(link.path) ? 'var(--forest)' : 'var(--mist)',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr style={{ borderColor: 'var(--stone)' }} className="my-3" />
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg font-medium"
                      style={{ color: 'var(--ink)' }}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg font-medium"
                      style={{ color: 'var(--ink)' }}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/swap"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg font-medium"
                      style={{ color: 'var(--ink)' }}
                    >
                      Swap
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg font-medium"
                      style={{ color: '#991B1B' }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="pt-3 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg font-medium text-center"
                      style={{ color: 'var(--ink)' }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center py-3 mx-4 rounded-lg font-semibold"
                      style={{
                        background: 'var(--gold)',
                        color: 'var(--charcoal)',
                      }}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
