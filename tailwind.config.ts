import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['PokemonGB', 'sans-serif'],
      },
      animation: {
        'scale-up':
          'scale-up 0.3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
        'scale-down':
          'scale-down 0.3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
      },
      keyframes: {
        'scale-down': {
          '0%': {
            transform: 'scale(1.15)',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'scale-up': {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(1.15)',
            opacity: '1',
          },
        },
        glowing: {
          '0%': {
            'background-color': '#FF69B4' /* Initial glow color (pink) */,
            'box-shadow': '0 0 10px #FF69B4' /* Initial glow color (pink) */,
          },
          '50%': {
            'background-color': '#8A2BE2' /* Middle glow color (purple) */,
            'box-shadow': '0 0 20px #8A2BE2' /* Middle glow color (purple) */,
          },
          '100%': {
            'background-color': '#FFA500' /* Final glow color (orange) */,
            'box-shadow': '0 0 10px #FFA500' /* Final glow color (orange) */,
          },
        },
      },
    },
  },
} satisfies Config
