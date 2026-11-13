import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * The app is designed for phones (Figma frames are 402pt wide). On the web the
 * whole app is rendered inside a centred column of at most this width, so every
 * layout calculation must use the column width rather than the browser width.
 */
export const APP_MAX_WIDTH = 480;

/** Phones narrower than this (iPhone SE 1st gen, small Androids) get compact spacing. */
export const COMPACT_WIDTH = 360;

/**
 * Measured width of the web phone column. The browser window width can be wider
 * than the space the app really gets (desktop scrollbars, page zoom, emulators),
 * and sizing two cards from it pushes the second card onto its own row.
 */
export const ScreenWidthContext = createContext<number | null>(null);

export function useScreenWidth() {
  const { width } = useWindowDimensions();
  const measured = useContext(ScreenWidthContext);
  return measured ?? Math.min(width, APP_MAX_WIDTH);
}

export function useScreen() {
  const width = useScreenWidth();
  return { width, compact: width < COMPACT_WIDTH };
}
