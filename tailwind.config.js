/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ts: {
          bg: "var(--ts-bg)",
          'bg-soft': "var(--ts-bg-soft)",
          ink: "var(--ts-ink)",
          'ink-soft': "var(--ts-ink-soft)",
          accent: "var(--ts-accent)",
          'accent-dark': "var(--ts-accent-dark)",
          'accent-soft': "var(--ts-accent-soft)",
          line: "var(--ts-line)",
          paper: "var(--ts-paper)"
        },
        bitcoin: {
          orange: "var(--ts-accent)",
          gold: "var(--ts-accent-soft)",
          'dark': '#0a0b0d',
          'gray': '#13151a',
        },
        luxury: {
          gold: '#d4af37',
          silver: '#c0c0c0',
          bronze: '#cd7f32',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'ui-serif', 'serif'],
        sans: ['"Inter"', '"Source Sans 3"', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(0,0,0,.35)',
      },
      backgroundImage: {
        'bitcoin-gradient': 'linear-gradient(135deg, #f7931a 0%, #ffb81c 50%, #d4af37 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0a0b0d 0%, #13151a 50%, #1a1d24 100%)',
      }
    },
  },
  plugins: [],
}
