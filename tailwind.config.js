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
          ivory: '#FFF5F8',     // Soft Delicate Pinkish Cream
          plum: '#E60067',      // Vibrant Magenta/Pink (Primary Logo Color)
          plumDark: '#C20054',  // Deep Rich Magenta hover
          plumLight: '#FF3385', // Light Vibrant Pink
          kesari: '#1565C0',    // Royal Blue (Secondary Logo Color)
          kesariLight: '#1E88E5',
          rose: '#F8BBD0',      // Soft Rose Pink Accent
          gold: '#FF4081',      // Pink Rose Gold Accent
          blue: '#0D47A1',      // Deep Royal Blue Accent
          charcoal: '#1F191B',  // Deep Rich Charcoal text
          gray: '#6B6366',      // Warm Gray secondary text
          lightBg: '#FFF0F5',   // Soft background
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Rozha One', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'Rozha One', 'sans-serif'],
      },
      backgroundImage: {
        'paithani-pattern': "radial-gradient(#E60067 0.75px, transparent 0.75px), radial-gradient(#E60067 0.75px, #FFF5F8 0.75px)",
        'hero-gradient': "linear-gradient(to right, rgba(230, 0, 103, 0.95), rgba(13, 71, 161, 0.85), rgba(230, 0, 103, 0.4))",
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(230, 0, 103, 0.12), 0 4px 12px -2px rgba(230, 0, 103, 0.06)',
        'luxury-hover': '0 20px 40px -15px rgba(230, 0, 103, 0.22), 0 8px 16px -4px rgba(230, 0, 103, 0.12)',
        'gold-glow': '0 0 15px rgba(230, 0, 103, 0.3)',
      }
    },
  },
  plugins: [],
}
