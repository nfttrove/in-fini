/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('dark-mode', '.dark-mode &');
      addVariant('light-mode', '.light-mode &');
      addVariant('coffee-mode', '.coffee-mode &');
    },
  ],
};
