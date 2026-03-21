/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        surface: {
          primary: '#fafafa',
          secondary: '#f0f0f2',
        },
        accent: {
          rose: '#e11d48',
          amber: '#d97706',
          violet: '#7c3aed',
          emerald: '#059669',
        },
      },
    },
  },
  plugins: [],
};
