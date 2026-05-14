/**
 * Centralized color tokens — mirrors tailwind.config.js (NativeWind).
 * Use NativeWind className for layout/styling in JSX;
 * use this hook when you need raw color values (SVGs, charts, or
 * third-party components that don't accept className).
 */
export const colorTheme = {
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
    default: '#c8a96e',
    hover:   '#d4b87a',
    dim:     '#8a7048',
  },
  border: {
    default: '#2a2d3a',
    subtle:  '#1e2130',
  },
  danger:  '#e05555',
  success: '#4caf7d',
} as const;

export type ColorTheme = typeof colorTheme;

export function useColorTheme() {
  return colorTheme;
}
