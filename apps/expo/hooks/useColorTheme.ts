/**
 * Centralized color tokens — imports from shared /theme/colors.json.
 * Use NativeWind className for layout/styling in JSX;
 * use this hook when you need raw color values (SVGs, charts, or
 * third-party components that don't accept className).
 */
import colors from '../../../theme/colors.json';

const { dark } = colors;

export const colorTheme = {
  bg: dark.bg,
  content: dark.content,
  accent: {
    default: dark.accent.DEFAULT,
    hover:   dark.accent.hover,
    dim:     dark.accent.dim,
  },
  gold: {
    default: dark.gold.DEFAULT,
    dim:     dark.gold.dim,
  },
  border: {
    default: dark.border.DEFAULT,
    subtle:  dark.border.subtle,
  },
  danger:  dark.danger,
  success: dark.success,
} as const;

export type ColorTheme = typeof colorTheme;

export function useColorTheme() {
  return colorTheme;
}
