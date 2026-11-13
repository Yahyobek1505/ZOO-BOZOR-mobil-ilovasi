import React, { createContext, useContext } from "react";
import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from "react-native";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

// Nested <Text> must keep inheriting its parent's colour, so only the outermost one gets the theme default.
const InsideText = createContext(false);

// Plus Jakarta Sans has no Cyrillic letters, so Russian text fell back to a system font.
// Inter has them; use the closest Inter weight for Cyrillic text.
const CYRILLIC_FONT: Record<string, string> = {
  PlusJakartaSans_500Medium: "Inter_500Medium",
  PlusJakartaSans_600SemiBold: "Inter_600SemiBold",
  PlusJakartaSans_700Bold: "Inter_700Bold",
  PlusJakartaSans_800ExtraBold: "Inter_700Bold",
};
const hasCyrillic = (value: React.ReactNode): boolean =>
  typeof value === "string" ? /[Ѐ-ӿ]/.test(value) : Array.isArray(value) && value.some(hasCyrillic);

function cyrillicSafe<S>(style: S, cyrillic: boolean): S | [S, { fontFamily: string }] {
  if (!cyrillic) return style;
  const family = StyleSheet.flatten(style as StyleProp<TextStyle>)?.fontFamily;
  const swap = family ? CYRILLIC_FONT[family] : undefined;
  return swap ? [style, { fontFamily: swap }] : style;
}

function localizeChildren(children: React.ReactNode, t: (value: string) => string): React.ReactNode {
  if (typeof children === "string") return t(children);
  if (!Array.isArray(children)) return children;
  return children.map((child, index) =>
    typeof child === "string" ? t(child) : React.isValidElement(child) ? React.cloneElement(child, { key: child.key ?? index }) : child,
  );
}

/** Translates the app's shared, visible strings while preserving rich Text children. */
export function Text({ children, accessibilityLabel, style, ...props }: TextProps) {
  const { t } = useLocale();
  const { C } = useTheme();
  const nested = useContext(InsideText);
  const content = localizeChildren(children, t);
  const themed = nested ? style : [{ color: C.text }, style];
  return <NativeText
    {...props}
    style={cyrillicSafe(themed, hasCyrillic(content))}
    accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}
  ><InsideText.Provider value>{content}</InsideText.Provider></NativeText>;
}

/** Keeps text-entry labels and placeholders in the selected language too. */
export function TextInput({ placeholder, accessibilityLabel, style, placeholderTextColor, ...props }: TextInputProps) {
  const { t, language } = useLocale();
  const { C } = useTheme();
  return <NativeTextInput
    {...props}
    style={cyrillicSafe([{ color: C.text }, style], language === "ru")}
    placeholderTextColor={placeholderTextColor ?? C.mutedForeground}
    placeholder={placeholder ? t(placeholder) : undefined}
    accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}
  />;
}
