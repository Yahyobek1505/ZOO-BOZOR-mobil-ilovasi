import colors from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

/** Active palette plus `radius` (kept for the scaffold screens that still use this hook). */
export function useColors() {
  const { C } = useTheme();
  return { ...C, radius: colors.radius };
}
