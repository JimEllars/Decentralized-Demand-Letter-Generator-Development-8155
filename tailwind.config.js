/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'axim-gold': '#FFEA00',
        'axim-purple': '#8A2BE2',
        'axim-teal': '#00E5FF',
        'bg-void': '#050505',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glass': 'rgba(255, 255, 255, 0.03)',
      },
      borderColor: {
        'subtle': 'rgba(255, 255, 255, 0.1)',
        'active': 'rgba(255, 255, 255, 0.25)',
      }
    }
  },
  plugins: [],
}