const { dark } = require('../../theme/colors.json');

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
        bg:      dark.bg,
        content: dark.content,
        accent:  dark.accent,
        gold:    dark.gold,
        border:  dark.border,
        danger:  dark.danger,
        success: dark.success,
      },
    },
  },
  plugins: [],
};
