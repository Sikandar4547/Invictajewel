/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--bg)',
          card: 'var(--card)',
          ink: 'var(--text)',
          'ink-muted': 'var(--text-muted)',
          border: 'var(--border)',
          field: 'var(--input-bg)',
          accent: 'var(--accent)',
        },
        jewel: {
          gold: '#C9A14A',
          'gold-light': '#D7B56A',
          'gold-dark': '#B78D33',
          ivory: '#FAF9F6',
          text: '#1A1A1A',
          sale: '#DC2626',
          accent: '#C9A14A',
        },
      },

      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        price: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        'luxury-xl': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'luxury-lg': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'luxury-md': ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }],
      },

      spacing: {
        '18': '4.5rem',
        '20': '5rem',
        '28': '7rem',
      },

      borderRadius: {
        'luxury': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },

      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },

      maxWidth: {
        'content': '80rem',
        'form': '600px',
        'product-grid': '1400px',
      },

      transitionDuration: {
        '400': '400ms',
      },

      backdropBlur: {
        'sm': '4px',
        'md': '12px',
      },
    },
  },
  plugins: [],
};
