/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#FF5A5F',
        'primary-hover': '#E04E53',
        bg: '#F7F7F9',
        surface: '#FFFFFF',
        'surface-glass': 'rgba(255, 255, 255, 0.85)',
        text: '#222222',
        'text-muted': '#717171',
        border: '#EBEBEB',
        'cat-gem': '#E76F51',
        'cat-lookout': '#2D5A4B',
        'cat-food': '#F4A261',
        'cat-meetup': '#6B5B95',
        'cat-other': '#8B8680',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0,0,0,0.08)',
        'md': '0 8px 24px rgba(0,0,0,0.12)',
        'lg': '0 16px 48px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        'DEFAULT': '20px',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [require("daisyui")],
}
