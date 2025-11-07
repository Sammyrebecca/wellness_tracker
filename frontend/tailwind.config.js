/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#38BDF8',
        secondary: '#A78BFA',
        background: '#F8FAFC',
        slateText: '#1E293B',
        coolGray: '#64748B',
        positive: '#10B981',
        warning: '#F59E0B',
        error: '#F43F5E',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        numeric: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '20px',
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(2, 6, 23, 0.2)',
      },
    },
  },
  plugins: [],
}

