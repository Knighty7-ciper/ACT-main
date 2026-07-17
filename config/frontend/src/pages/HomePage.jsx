import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Globe, Shield, Zap, TrendingUp, Wallet, BarChart3, Lock, ChevronRight, LineChart, Globe2, Percent } from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Forest green  #1A3D2B  — trust, depth, African landscape
// Warm gold     #C9A84C  — prosperity, royalty, sunlight
// Ivory         #F7F4EF  — warmth, paper, non-digital humanity
// Charcoal      #1C1C1E  — gravitas, precision
// Sage          #4A7C59  — secondary green, nature
// Stone         #E4E0D8  — border, subtle divider
// ──────────────────────────────────────────────────────────────────────────────

// ─── EAST AFRICA CONSTELLATION SVG ───────────────────────────────────────────
const EastAfricaConstellation = () => {
  const nodes = [
    { id: 'NBI', label: 'Nairobi', x: 62, y: 52, r: 6, primary: true },
    { id: 'DAR', label: 'Dar es Salaam', x: 66, y: 68, r: 4 },
    { id: 'KLA', label: 'Kampala', x: 55, y: 42, r: 4 },
    { id: 'ADD', label: 'Addis Ababa', x: 72, y: 28, r: 4.5 },
    { id: 'KIG', label: 'Kigali', x: 50, y: 55, r: 3.5 },
    { id: 'JUB', label: 'Juba', x: 60, y: 30, r: 3 },
    { id: 'LUS', label: 'Lusaka', x: 52, y: 80, r: 3 },
    { id: 'HRR', label: 'Harare', x: 56, y: 90, r: 3 },
    { id: 'MGD', label: 'Mogadishu', x: 82, y: 38, r: 3 },
    { id: 'DJI', label: 'Djibouti', x: 82, y: 24, r: 2.5 },
  ];

  const edges = [
    ['NBI', 'DAR'], ['NBI', 'KLA'], ['NBI', 'ADD'], ['NBI', 'KIG'],
    ['KLA', 'KIG'], ['KLA', 'JUB'], ['ADD', 'JUB'], ['ADD', 'MGD'],
    ['ADD', 'DJI'], ['DAR', 'LUS'], ['LUS', 'HRR'], ['DAR', 'KIG'],
  ];

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <svg
      viewBox="0 0 100 120"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.15))' }}
    >
      <defs>
        <radialGradient id="glow-gold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrow" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <circle cx="2" cy="2" r="1" fill="#C9A84C" opacity="0.5" />
        </marker>
      </defs>

      {/* Trade route lines */}
      {edges.map(([a, b], i) => {
        const na = getNode(a), nb = getNode(b);
        return (
          <line
            key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke="#C9A84C"
            strokeWidth="0.3"
            strokeOpacity="0.25"
            strokeDasharray="1.5 2"
          >
            <animate
              attributeName="strokeDashoffset"
              from="0" to="-7"
              dur={`${2.5 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </line>
        );
      })}

      {/* Pulse rings on primary node */}
      <circle cx={62} cy={52} r={14} fill="url(#glow-gold)" opacity="0.4">
        <animate attributeName="r" values="10;18;10" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* City nodes */}
      {nodes.map((n) => (
        <g key={n.id} filter={n.primary ? 'url(#node-glow)' : ''}>
          <circle
            cx={n.x} cy={n.y} r={n.r + 2}
            fill={n.primary ? '#C9A84C' : '#1A3D2B'}
            fillOpacity="0.2"
          />
          <circle
            cx={n.x} cy={n.y} r={n.r}
            fill={n.primary ? '#C9A84C' : '#4A7C59'}
            fillOpacity={n.primary ? 0.9 : 0.7}
          />
          <circle cx={n.x} cy={n.y} r={n.r * 0.45} fill="#F7F4EF" fillOpacity="0.8" />
        </g>
      ))}

      {/* City labels */}
      {nodes.filter(n => n.primary || n.r >= 4).map((n) => (
        <text
          key={`lbl-${n.id}`}
          x={n.x + n.r + 1.5}
          y={n.y + 1}
          fontSize="3.5"
          fill="#F7F4EF"
          fillOpacity="0.55"
          fontFamily="DM Sans, sans-serif"
          letterSpacing="0.2"
        >
          {n.label}
        </text>
      ))}
    </svg>
  );
};

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
const AnimatedCounter = ({ value, suffix = '', prefix = '' }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(value);
    let start = 0;
    const step = num / 40;
    const interval = setInterval(() => {
      start += step;
      if (start >= num) { setDisplay(num); clearInterval(interval); }
      else setDisplay(Math.floor(start));
    }, 30);
    return () => clearInterval(interval);
  }, [inView, value]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
};

// ─── SPARKLINE SVG ───────────────────────────────────────────────────────────
const Sparkline = ({ points, color = '#C9A84C' }) => {
  const w = 80, h = 24;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map(p => h - ((p - min) / range) * (h - 4) - 2);
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={`url(#sg-${color.replace('#','')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="2.5" fill={color} />
    </svg>
  );
};

// ─── BASKET ICON ─────────────────────────────────────────────────────────────
const BasketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [activeRegion, setActiveRegion] = useState('KEN');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const africanCurrencies = [
    { code: 'KEN', name: 'Kenya', currency: 'KES', pppValue: 155, stability: 75, flag: '🇰🇪', trend: [148,150,151,152,154,153,155] },
    { code: 'TZA', name: 'Tanzania', currency: 'TZS', pppValue: 2850, stability: 71, flag: '🇹🇿', trend: [2780,2800,2820,2810,2830,2845,2850] },
    { code: 'UGA', name: 'Uganda', currency: 'UGX', pppValue: 3850, stability: 73, flag: '🇺🇬', trend: [3700,3750,3780,3800,3820,3840,3850] },
    { code: 'ETH', name: 'Ethiopia', currency: 'ETB', pppValue: 125, stability: 70, flag: '🇪🇹', trend: [118,119,120,121,122,124,125] },
    { code: 'RWA', name: 'Rwanda', currency: 'RWF', pppValue: 1380, stability: 81, flag: '🇷🇼', trend: [1320,1340,1350,1360,1365,1375,1380] },
    { code: 'ZAF', name: 'South Africa', currency: 'ZAR', pppValue: 18.50, stability: 78, flag: '🇿🇦', trend: [17.8,18.0,18.1,18.2,18.3,18.4,18.5] },
    { code: 'NGA', name: 'Nigeria', currency: 'NGN', pppValue: 1450, stability: 65, flag: '🇳🇬', trend: [1380,1400,1410,1420,1430,1440,1450] },
    { code: 'GHA', name: 'Ghana', currency: 'GHS', pppValue: 15.20, stability: 72, flag: '🇬🇭', trend: [14.5,14.7,14.8,14.9,15.0,15.1,15.2] },
  ];

  const active = africanCurrencies.find(r => r.code === activeRegion);

  const features = [
    {
      icon: <Globe2 size={18} />,
      label: 'Borderless Value',
      color: '#1A3D2B',
      accent: '#4A7C59',
      text: 'Send value anywhere in Africa with consistent purchasing power. No geography-based penalties across the continent.',
    },
    {
      icon: <Percent size={18} />,
      label: 'PPP-Based Valuation',
      color: '#7A5820',
      accent: '#C9A84C',
      text: 'Value derived from a continental basket of real commodities — maize, fuel, transport, housing. Not speculation.',
    },
    {
      icon: <Shield size={18} />,
      label: 'Financial Sovereignty',
      color: '#1C3A4A',
      accent: '#4A7C8A',
      text: 'Own your wealth without traditional banks. Full control with non-custodial infrastructure built for African context.',
    },
  ];

  const steps = [
    {
      label: 'Commodity Basket',
      text: 'A standardised basket of essential goods is priced across East African markets using live data.',
      icon: <BasketIcon />,
    },
    {
      label: 'PPP Calculation',
      text: 'Our algorithm compares purchasing power across regions to determine fair token valuation daily.',
      icon: <BarChart3 size={18} />,
    },
    {
      label: 'Continental Stability',
      text: 'The unit automatically adjusts to maintain consistent purchasing power everywhere in Africa.',
      icon: <TrendingUp size={18} />,
    },
  ];

  return (
    <div className="pesa-root">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        {/* Left panel — dark forest green */}
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -30 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-eyebrow">
            <span className="dot" />
            Principle Partiality Price — Live Data
          </div>

          <h1 className="hero-heading">
            The <em>real value</em> of<br />
            money across Africa.
          </h1>

          <p className="hero-body">
            Pesa Africa anchors purchasing power to baskets of real goods —
            maize, fuel, transport, housing — across East Africa. No exchange
            rate speculation. Just economic truth.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              <Wallet size={15} />
              Open Account
            </Link>
            <Link to="/api" className="btn-ghost">
              <BarChart3 size={15} />
              Explore PPP Data
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <div className="stat-val">
                <AnimatedCounter value={10} suffix="+" />
              </div>
              <div className="stat-label">Currencies tracked</div>
            </div>
            <div>
              <div className="stat-val">
                <AnimatedCounter value={5} />
              </div>
              <div className="stat-label">Commodity baskets</div>
            </div>
            <div>
              <div className="stat-val">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <div className="stat-label">Transparent methodology</div>
            </div>
          </div>
        </motion.div>

        {/* Right panel — ivory with map + card */}
        <motion.div
          className="hero-right"
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          style={{ position: 'relative' }}
        >
          {/* Background constellation map */}
          <div className="hero-map" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <EastAfricaConstellation />
          </div>

          {/* PPP Card */}
          <div className="ppp-card">
            <div className="card-header">
              <div className="card-header-title">Pesa Africa — PPP Rate</div>
              <div className="card-header-badge">
                <div className="badge-dot" />
                <span>Live</span>
              </div>
            </div>

            <div className="card-body">
              {/* Region selector */}
              <div className="region-grid">
                {africanCurrencies.map(r => (
                  <button
                    key={r.code}
                    className={`region-btn ${activeRegion === r.code ? 'active' : ''}`}
                    onClick={() => setActiveRegion(r.code)}
                  >
                    {r.flag} {r.code}
                  </button>
                ))}
              </div>

              {/* PPP Value Display */}
              <div className="ppp-display">
                <div className="ppp-label">1 Pesa Africa in {active?.name}</div>
                <div className="ppp-value">
                  <span className="ppp-currency">{active?.currency}</span>
                  {active?.pppValue.toLocaleString()}
                </div>
              </div>

              {/* Stability row */}
              <div className="stability-row">
                <div className="stability-info">
                  <strong>{active?.stability}% Stability Index</strong>
                  <span>7-day rolling average</span>
                </div>
                <Sparkline points={active?.trend || []} />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION DIVIDER ──────────────────────────────────────────────── */}
      <div className="section-divider" style={{ padding: '0 64px', height: '1px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--stone)' }} />
        <div style={{ width: '5px', height: '5px', background: 'var(--gold)', transform: 'rotate(45deg)', flexShrink: 0 }} />
        <div style={{ flex: 1, height: '1px', background: 'var(--stone)' }} />
      </div>

      {/* ── DATA STRIP ───────────────────────────────────────────────────── */}
      <div className="data-strip">
        {[
          { val: '14', suf: ' markets', lbl: 'Price sources indexed' },
          { val: '3', suf: ' countries', lbl: 'East Africa coverage' },
          { val: '∞', suf: '', lbl: 'Divisibility' },
          { val: '0', suf: '%', lbl: 'Transfer premium' },
        ].map((item, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="data-item">
              <div className="data-val">{item.val}{item.suf}</div>
              <div className="data-lbl">{item.lbl}</div>
            </div>
            {i < arr.length - 1 && <div className="data-strip-divider" />}
          </div>
        ))}
      </div>

      {/* ── VALUE PROPOSITIONS ───────────────────────────────────────────── */}
      <section className="value-section">
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="section-eyebrow">Why Pesa Africa</div>
          <h2 className="section-heading">
            Built on <em>economic reality,</em><br />
            not exchange rate fiction.
          </h2>

          <div className="feature-grid">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div
                  className="feature-icon-wrap"
                  style={{ background: f.color, color: '#fff', opacity: 0.9 }}
                >
                  {f.icon}
                </div>
                <div className="feature-title">{f.label}</div>
                <p className="feature-text">{f.text}</p>
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: f.accent, fontSize: '13px', fontWeight: 600 }}>
                  Learn more <ArrowRight size={13} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="how-section">
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'rgba(201,168,76,0.7)' }}>Methodology</div>
          <h2 className="how-heading">
            How the PPP<br />
            <em>basket works.</em>
          </h2>

          <div className="steps-grid">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className="step-number">0{i + 1}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.label}</div>
                <p className="step-text">{s.text}</p>
                {i < steps.length - 1 && <div className="step-connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="section-eyebrow" style={{ marginBottom: '16px' }}>Get started today</div>
        <h2 className="cta-heading">
          Join Africa's <em>first</em> purchasing-power<br />
          financial infrastructure.
        </h2>
        <p className="cta-body">
          Thousands of users across East Africa have access to fair, borderless
          value exchange anchored to real economic conditions.
        </p>
        <div className="cta-actions">
          <Link to="/register" className="btn-primary-dark">
            <Wallet size={15} />
            Create Free Account
          </Link>
          <Link to="/blog" className="btn-outline-dark">
            <BarChart3 size={15} />
            Read the Research
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
