/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Pesa Africa palette (new design system) ──────────────────────
        // Forest green — primary brand surface
        forest: {
          DEFAULT: '#1A3D2B',
          50:  '#E8EFEA',
          100: '#C9D6CE',
          200: '#94AFA0',
          300: '#5E8872',
          400: '#366148',
          500: '#1A3D2B',
          600: '#163324',
          700: '#122A1D',
          800: '#0D2015',
          900: '#08160E',
        },
        // Sage — secondary green
        sage: {
          DEFAULT: '#4A7C59',
          50:  '#ECF1EE',
          100: '#CFE0D5',
          200: '#A0C0AC',
          300: '#7BA78C',
          400: '#5C8E72',
          500: '#4A7C59',
          600: '#3A6347',
          700: '#2B4A35',
          800: '#1C3224',
          900: '#0D1912',
        },
        // Warm gold — prosperity, accents
        gold: {
          DEFAULT: '#C9A84C',
          50:  '#FBF6E6',
          100: '#F5E9BF',
          200: '#EFD98A',
          300: '#E8C97A',
          400: '#D9B863',
          500: '#C9A84C',
          600: '#A78935',
          700: '#85691F',
          800: '#634A0F',
          900: '#422B00',
        },
        // Ivory — warm page surface
        ivory: {
          DEFAULT: '#F7F4EF',
          50:  '#FDFCFA',
          100: '#F7F4EF',
          200: '#EDE9E1',
          300: '#E4E0D8',
          400: '#D8D3C8',
        },
        // Charcoal — primary text, dark surfaces
        charcoal: {
          DEFAULT: '#1C1C1E',
          500: '#1C1C1E',
          600: '#2C2C2E',
          700: '#3A3A3D',
        },
        // Stone — borders, dividers
        stone: {
          DEFAULT: '#D8D3C8',
          400: '#C2BCAE',
          500: '#A89F8E',
          600: '#8A8170',
        },
        // Mist — muted body text
        mist: {
          DEFAULT: '#6B6B6B',
          500: '#6B6B6B',
          600: '#525252',
        },

        // ── Legacy palettes (kept for backward compatibility) ─────────────
        // Original primary (indigo) — still used by some pages
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        slate: {
          850: '#172033',
        }
      },
      fontFamily: {
        // Body and UI — DM Sans (new design)
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        // Display headings — Cormorant Garamond (new design) with Space Grotesk fallback
        display: ['Cormorant Garamond', 'Space Grotesk', 'Georgia', 'serif'],
        // Monospace — DM Mono (new design) with JetBrains Mono fallback
        mono: ['DM Mono', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
