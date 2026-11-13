/**
 * Design tokens. Both palettes share the same keys; screens read the active one through
 * `useTheme()` / `makeStyles()` (context/ThemeContext.tsx).
 *
 * Token meaning (keep to it so the dark palette works):
 * - `text`      main text and icons on page/card backgrounds (navy by day, white at night)
 * - `surface`   page background;  `card` raised blocks;  `subtle` soft blocks inside a page
 * - `navy`      brand dark fills: headers, primary buttons, price boxes — content on it uses `white`
 * - `white`     always white: text/icons on navy, never a card background (use `card`)
 * - `ink`       always navy: text/icons on lime
 */
const light = {
  /** true in the night palette — for the few styles that differ by more than a colour swap. */
  dark: false as boolean,
  text: '#080D20',
  tint: '#D0FE17',
  background: '#F6F6F6',
  foreground: '#080D20',
  card: '#FFFFFF',
  cardForeground: '#080D20',
  primary: '#080D20',
  primaryForeground: '#FFFFFF',
  secondary: '#ECEEF2',
  secondaryForeground: '#080D20',
  muted: '#ECEEF2',
  mutedForeground: '#9AA0B7',
  mutedDark: '#596388',
  accent: '#D0FE17',
  accentForeground: '#080D20',
  destructive: '#FF1810',
  destructiveForeground: '#FFFFFF',
  border: '#E2E2E2',
  input: '#E2E2E2',
  navy: '#080D20',
  navySoft: '#1B2136',
  lime: '#D0FE17',
  white: '#FFFFFF',
  ink: '#080D20',
  surface: '#F6F6F6',
  subtle: '#F9F9F9',
  star: '#FFC300',
  sale: '#E61F18',
  success: '#45C82A',
  successSoft: '#E8F9E5',
  warning: '#FFC300',
  glassNavy: 'rgba(8,13,32,0.72)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassTab: 'rgba(6,13,38,0.2)',
  overlay: 'rgba(8,13,32,0.65)',
};

export type Palette = typeof light;

// Night palette follows the Figma live-auction screen: near-black navy page, lifted navy cards,
// white text, unchanged lime accent.
const dark: Palette = {
  ...light,
  dark: true,
  text: '#FFFFFF',
  background: '#080D20',
  foreground: '#FFFFFF',
  card: '#151B30',
  cardForeground: '#FFFFFF',
  primary: '#1E2540',
  secondary: '#1E2540',
  secondaryForeground: '#FFFFFF',
  muted: '#1E2540',
  mutedForeground: '#8C93AD',
  mutedDark: '#A6ADC8',
  border: '#2A3150',
  input: '#2A3150',
  navy: '#1E2540',
  navySoft: '#2A3150',
  surface: '#080D20',
  subtle: '#151B30',
  successSoft: '#16301F',
  glassTab: 'rgba(30,37,64,0.55)',
  overlay: 'rgba(0,0,0,0.6)',
};

const colors = { light, dark, radius: 16 };

export const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  dMedium: 'PlusJakartaSans_500Medium',
  dSemibold: 'PlusJakartaSans_600SemiBold',
  dBold: 'PlusJakartaSans_700Bold',
  dExtra: 'PlusJakartaSans_800ExtraBold',
};

export default colors;
