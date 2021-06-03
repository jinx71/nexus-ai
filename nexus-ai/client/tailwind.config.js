/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Nexus AI accent — a purple→blue range used as the single brand accent.
        brand: {
          50: '#f1f0ff',
          100: '#e6e4ff',
          200: '#d0ccff',
          300: '#b1a8ff',
          400: '#8f7bff',
          500: '#7152ff', // primary
          600: '#5f37f5',
          700: '#4f27d8',
          800: '#4222ae',
          900: '#39228b',
        },
        sky2: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        ink: {
          50: '#f7f7fb',
          100: '#eeeef5',
          200: '#dcdce8',
          300: '#bcbccf',
          400: '#9494b0',
          500: '#6f6f90',
          600: '#555573',
          700: '#42425a',
          800: '#2a2a3c',
          900: '#181826',
        },
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(82, 56, 255, 0.25)',
        card: '0 1px 2px rgba(24,24,38,0.06), 0 8px 24px -12px rgba(24,24,38,0.18)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #7152ff 0%, #5f37f5 35%, #0ea5e9 100%)',
        'brand-gradient-soft': 'linear-gradient(120deg, #f1f0ff 0%, #eef6ff 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
