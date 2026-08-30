/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ivory: '#FAFAF5',     // Pure Soft Pearl Cream
          plum: '#800020',      // Royal Shendur Kumkum Maroon (Primary)
          plumDark: '#5C0017',  // Deep Burgundy Dark Maroon hover
          plumLight: '#A31D38', // Vibrant Vermilion Maroon
          kesari: '#D97706',    // Warm Maharashtrian Saffron / Kesari
          kesariLight: '#F59E0B',
          rose: '#D98894',      // Soft Lagna Rose Accent
          gold: '#D4AF37',      // Paithani Zari Gold
          charcoal: '#1F191B',  // Deep Rich Charcoal text
          gray: '#6B6366',      // Warm Gray secondary text
          lightBg: '#F5EFEB',   // Soft container background
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Rozha One', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'Rozha One', 'sans-serif'],
      },
      backgroundImage: {
        'paithani-pattern': "radial-gradient(#C9A35B 0.75px, transparent 0.75px), radial-gradient(#C9A35B 0.75px, #FCF8F3 0.75px)",
        'hero-gradient': "linear-gradient(to right, rgba(84, 38, 61, 0.95), rgba(84, 38, 61, 0.75), rgba(84, 38, 61, 0.3))",
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(84, 38, 61, 0.08), 0 4px 12px -2px rgba(84, 38, 61, 0.04)',
        'luxury-hover': '0 20px 40px -15px rgba(84, 38, 61, 0.16), 0 8px 16px -4px rgba(84, 38, 61, 0.08)',
        'gold-glow': '0 0 15px rgba(201, 163, 91, 0.3)',
      }
    },
  },
  plugins: [],
}
