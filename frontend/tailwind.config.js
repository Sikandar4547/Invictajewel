/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        jewel: {
          gold: '#B76E2E',
          goldlight: '#C97E3A',
          charcoal: '#2C2C2C',
          rose: '#E8C39E',
          cream: '#F9F6F0',
          text: '#333333',
          sale: '#E53E3E',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        price: ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
