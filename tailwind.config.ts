import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}', // if you're using pages/
  ],
  theme: {
    extend: {
      fontFamily: {
        japanese: ['"Sawarabi Mincho"', 'serif'],
        bitcount: ['"Bitcount Single"', 'sans-serif'],
        titillium: ['"Titillium Web"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
