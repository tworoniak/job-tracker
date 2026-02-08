/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0B',
        surface: '#111114',
        card: '#18181D',
        border: '#22222A',

        text: '#F5F5F5',
        muted: '#C9C9D1',
        subtle: '#8B8B95',
        faint: '#5A5A63',

        accent: '#B01C2E', // Crimson Stage
        accentBlue: '#3A86FF', // Electric Blue

        matteBlack: '#212738',
        eggplant: '#42313b',
        taupe: '#595149',
        slateGray: '#6b7893',
        lavender: '#eaeafc',

        // Monochromatic
        whiteSmoke: '#f5f5f5ff',
        silver: '#bdbdbdff',
        graphite: '#3a3a3aff',
        graphite2: '#2b2b2bff',
        carbonBlack: '#1a1a1aff',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
