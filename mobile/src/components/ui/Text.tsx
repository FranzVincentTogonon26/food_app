import { Text as RNText, type TextProps, type TextStyle } from "react-native";

import {
  bodyFamily,
  displayFamily,
  type BodyWeight,
  type DisplayWeight,
} from "@/theme/fonts";
import { useTheme } from "@/theme/theme";
import type { Palette } from "@/theme/tokens";

type Props = TextProps & {
  /** 'body' → DM Sans, 'display' → Bricolage Grotesque */
  f?: "body" | "display";
  /** font weight (CSS) */
  w?: BodyWeight;
  /** font size in px */
  s?: number;
  /** line-height multiplier (CSS unitless) */
  lh?: number;
  /** letter spacing, in ems (e.g. -0.03) */
  ls?: number;
  /** palette key or raw colour */
  c?: keyof Palette | (string & {});
  upper?: boolean;
  center?: boolean;
  /** tabular figures */
  tabular?: boolean;
};

export function T({
  f = "body",
  w = 400,
  s = 14,
  lh,
  ls,
  c = "text1",
  upper,
  center,
  tabular,
  style,
  ...rest
}: Props) {
  const { c: pal } = useTheme();
  const color = (pal as Record<string, string>)[c] ?? c;

  const base: TextStyle = {
    fontFamily:
      f === "display"
        ? displayFamily(Math.max(600, w) as DisplayWeight, s)
        : bodyFamily(w),
    fontSize: s,
    color,
  };

  if (lh) base.lineHeight = Math.round(s * lh * 10) / 10;
  if (ls) base.letterSpacing = s * ls;
  if (upper) base.textTransform = "uppercase";
  if (center) base.textAlign = "center";
  if (tabular) base.fontVariant = ["tabular-nums"];

  return <RNText maxFontSizeMultiplier={1.25} {...rest} style={[base, style]} />;
}

/** Eyebrow label: 11px, bold, uppercase, widely spaced. */
export function Eyebrow({
  c = "text3",
  s = 11,
  style,
  ...rest
}: Omit<Props, "f" | "w" | "ls" | "upper">) {
  return <T f="body" w={700} s={s} ls={0.1} upper c={c} style={style} {...rest} />;
}
