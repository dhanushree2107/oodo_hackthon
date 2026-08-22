/** @type {import('tailwindcss').Config} */
export default {
<<<<<<< HEAD
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
=======
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
>>>>>>> a46455f2533f3d5280c535476a12159845fb687c
  theme: {
    extend: {
      colors: {
        brand: {
<<<<<<< HEAD
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          900: '#312E81',
        },
        navy: {
          950: '#070A0F',
          900: '#0B0F17',
          850: '#0F1623',
          800: '#141E30',
          750: '#1A263D',
          700: '#223252',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
=======
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        dark: {
          bg: '#0B0F17',
          surface: '#151D2A',
          card: '#1E293B',
          border: '#334155'
        }
      }
>>>>>>> a46455f2533f3d5280c535476a12159845fb687c
    },
  },
  plugins: [],
}
