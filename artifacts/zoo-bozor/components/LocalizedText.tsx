import React from "react";
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
} from "react-native";
import { useLocale } from "@/context/LocaleContext";

function localizeChildren(children: React.ReactNode, t: (value: string) => string): React.ReactNode {
  if (typeof children === "string") return t(children);
  if (!Array.isArray(children)) return children;
  return children.map((child, index) =>
    typeof child === "string" ? t(child) : React.isValidElement(child) ? React.cloneElement(child, { key: child.key ?? index }) : child,
  );
}

/** Translates the app's shared, visible strings while preserving rich Text children. */
export function Text({ children, ...props }: TextProps) {
  const { t } = useLocale();
  return <NativeText {...props}>{localizeChildren(children, t)}</NativeText>;
}

/** Keeps text-entry labels and placeholders in the selected language too. */
export function TextInput({ placeholder, accessibilityLabel, ...props }: TextInputProps) {
  const { t } = useLocale();
  return <NativeTextInput
    {...props}
    placeholder={placeholder ? t(placeholder) : undefined}
    accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}
  />;
}
