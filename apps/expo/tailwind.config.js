/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#0f1117',
          surface:  '#1a1d27',
          elevated: '#242736',
        },
        content: {
          primary:   '#e8e3d8',
          secondary: '#9a9490',
          muted:     '#5a5760',
        },
        accent: {
          DEFAULT: '#c8a96e',
          hover:   '#d4b87a',
          dim:     '#8a7048',
        },
        border: {
          DEFAULT: '#2a2d3a',
          subtle:  '#1e2130',
        },
        danger:  '#e05555',
        success: '#4caf7d',
      },
    },
  },
  plugins: [],
};
