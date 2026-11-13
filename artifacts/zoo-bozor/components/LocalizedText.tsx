import React, { createContext, useContext } from "react";
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
} from "react-native";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

// Nested <Text> must keep inheriting its parent's colour, so only the outermost one gets the theme default.
const InsideText = createContext(false);

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
  return <NativeText
    {...props}
    style={nested ? style : [{ color: C.text }, style]}
    accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}
  ><InsideText.Provider value>{localizeChildren(children, t)}</InsideText.Provider></NativeText>;
}

/** Keeps text-entry labels and placeholders in the selected language too. */
export function TextInput({ placeholder, accessibilityLabel, style, placeholderTextColor, ...props }: TextInputProps) {
  const { t } = useLocale();
  const { C } = useTheme();
  return <NativeTextInput
    {...props}
    style={[{ color: C.text }, style]}
    placeholderTextColor={placeholderTextColor ?? C.mutedForeground}
    placeholder={placeholder ? t(placeholder) : undefined}
    accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}
  />;
}
