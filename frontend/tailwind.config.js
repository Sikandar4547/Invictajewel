/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode (default)
        'light-bg': '#FFFFFF',
        'light-bg-secondary': '#F9F6F0',
        'light-text': '#1F2937',
        'light-text-secondary': '#6B7280',
        'light-border': '#E5E7EB',
        
        // Dark mode - improved for better visibility
        'dark-bg': '#242424',
        'dark-bg-secondary': '#3A3A3A',
        'dark-text': '#EEEFF2',
        'dark-text-secondary': '#D1D5DB',
        'dark-border': '#515151',

        jewel: {
          gold: '#B76E2E',
          'gold-light': '#D4A574',
          'gold-dark': '#8B5A1F',
          charcoal: '#2C2C2C',
          'charcoal-light': '#404040',
          rose: '#E8C39E',
          'rose-light': '#F5E6D3',
          cream: '#F9F6F0',
          'cream-dark': '#3A3A3A',
          text: '#1F2937',
          'text-light': '#6B7280',
          sale: '#DC2626',
          'sale-light': '#FEE2E2',
          accent: '#6366F1',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        price: ['Lato', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
