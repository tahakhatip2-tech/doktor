/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        primaryDark: '#5A52D5',
        secondary: '#38BDF8',
        background: '#0F172A',
        surface: '#1E293B',
        surfaceLight: '#334155',
        textMain: '#F1F5F9',
        textSecondary: '#94A3B8',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        border: '#334155',
      },
      fontFamily: {
        cairo: ['Cairo-Regular'],
        cairoSemiBold: ['Cairo-SemiBold'],
        cairoBold: ['Cairo-Bold'],
      }
    },
  },
  plugins: [],
}
