/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#20312b',
        forest: '#2f604b',
        'forest-dark': '#244b3a',
        sage: '#e8eee7',
        cream: '#f7f7f2',
        muted: '#66736d',
        coral: '#d98669',
      },
      boxShadow: {
        card: '0 12px 32px rgba(32, 49, 43, 0.07)',
        soft: '0 20px 60px rgba(32, 49, 43, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
