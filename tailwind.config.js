/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sunrise: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#EA580C',
          600: '#C2410C',
          badge: '#FFEDE0',
          text: '#9A3412',
        },
        tealpartner: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#0D9488',
          600: '#0F766E',
          badge: '#E0F8F5',
          text: '#115E59',
        },
        together: {
          bg: '#FFF1F2',
          border: '#FFE4E6',
          text: '#BE123C',
        },
        holiday: {
          restBg: '#FEF2F2',
          restText: '#DC2626',
          workBg: '#F3F4F6',
          workText: '#4B5563'
        }
      }
    },
  },
  plugins: [],
}
