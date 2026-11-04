import { forwardRef, useState, type ReactNode } from "react";
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { bodyFamily, type BodyWeight } from "@/theme/fonts";
import { useTheme } from "@/theme/theme";

import { Icon } from "./Icon";

type Props = Omit<TextInputProps, "style"> & {
  icon?: string;
  error?: boolean;
  right?: ReactNode;
  height?: number;
  radius?: number;
  /** body text weight */
  w?: BodyWeight;
  size?: number;
  /** surface1 (default) or bg (used inside cards) */
  tone?: "surface" | "bg";
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  /** letter spacing, in ems */
  ls?: number;
  multilineRows?: number;
};

export const Field = forwardRef<TextInput, Props>(function Field(
  {
    icon,
    error,
    right,
    height = 54,
    radius = 18,
    w = 500,
    size = 15,
    tone = "surface",
    style,
    inputStyle,
    ls,
    multilineRows,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const { c, dark } = useTheme();
  const [focus, setFocus] = useState(false);
  const multiline = !!multilineRows;
  const border = error ? c.err : focus ? c.accent : c.line;

  return (
    <View
      style={[
        {
          minHeight: multiline ? undefined : height,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: border,
          backgroundColor: tone === "bg" ? c.bg : c.surface1,
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            position: "absolute",
            left: 16,
            top: 0,
            bottom: multiline ? undefined : 0,
            paddingTop: multiline ? 14 : 0,
            justifyContent: "center",
          }}
          pointerEvents="none"
        >
          <Icon name={icon} size={20} color="text3" />
        </View>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={c.text3}
        selectionColor={c.accent}
        cursorColor={c.accent}
        keyboardAppearance={dark ? "dark" : "light"}
        multiline={multiline}
        numberOfLines={multilineRows}
        textAlignVertical={multiline ? "top" : "center"}
        maxFontSizeMultiplier={1.25}
        // The visible label is a separate FieldLabel, so fall back to the
        // placeholder for screen readers.
        accessibilityLabel={rest.placeholder}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
        {...rest}
        style={[
          {
            flex: 1,
            minWidth: 0,
            height: multiline ? undefined : height - 2,
            minHeight: multiline
              ? (multilineRows ?? 2) * size * 1.5 + 28
              : undefined,
            paddingLeft: icon ? 48 : 16,
            paddingRight: right ? 4 : 16,
            paddingTop: multiline ? 14 : 0,
            paddingBottom: multiline ? 14 : 0,
            fontFamily: bodyFamily(w),
            fontSize: size,
            lineHeight: multiline ? size * 1.5 : undefined,
            letterSpacing: ls ? ls * size : undefined,
            color: c.text1,
          },
          inputStyle,
        ]}
      />
      {right ? (
        <View style={{ paddingRight: 6 }}>{right}</View>
      ) : null}
    </View>
  );
});

/**
 * Small uppercase label above a field (the eyebrow: 11px, bold, widely
 * spaced, in the third text colour).
 */
export { Eyebrow as FieldLabel } from "./Text";
