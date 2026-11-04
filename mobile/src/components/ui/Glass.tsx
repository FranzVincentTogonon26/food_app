import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/theme/theme";

/**
 * Frosted-glass surface.
 *
 * - "strong" - sheets, headers, CTA → glass-strong + blur(22px) saturate(1.6)
 * - "glass"  - nav | photo editing   → glass
 * - "nav"    - floating tab bar      → nav-glass + blur(30px) saturate(1.9)
 * - "photo"  - buttons over photos   → rgba(20,16,12,.38) + blur(18px)
 * - "frost"  - chips over photos     → rgba(255,255,255,.16) + blur(14px)
 *
 * iOS uses a native UIVisualEffectView. Android blur needs a BlurTargetView
 * ancestor, which doesn't compose with native-stack screens, so it falls back
 * to a slightly denser translucent fill.
 */
export type GlassVariant = "strong" | "glass" | "nav" | "photo" | "frost";

type Props = {
  variant?: GlassVariant;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  pointerEvents?: "auto" | "none" | "box-none" | "box-only";
};

const isIOS = process.env.EXPO_OS === "ios";

export function Glass({
  variant = "strong",
  style,
  children,
  pointerEvents,
}: Props) {
  const { c, dark } = useTheme();

  const fill = {
    strong: c.glassStrong,
    glass: c.glass,
    nav: c.navGlass,
    photo: "rgba(20,16,12,0.38)",
    frost: "rgba(255,255,255,0.16)",
  }[variant];

  const androidFill = {
    strong: dark ? "rgba(22,20,18,0.96)" : "rgba(255,252,248,0.97)",
    glass: dark ? "rgba(30,27,24,0.92)" : "rgba(255,255,255,0.92)",
    nav: dark ? "rgba(36,32,29,0.94)" : "rgba(252,249,245,0.94)",
    photo: "rgba(20,16,12,0.55)",
    frost: "rgba(255,255,255,0.24)",
  }[variant];

  const intensity = { strong: 40, glass: 40, nav: 55, photo: 30, frost: 24 }[
    variant
  ];

  const tint =
    variant === "photo"
      ? "dark"
      : variant === "frost"
        ? "light"
        : dark
          ? "dark"
          : "light";

  return (
    <View style={[styles.clip, style]} pointerEvents={pointerEvents}>
      {isIOS ? (
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFill}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: fill }]} />
        </BlurView>
      ) : (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: androidFill }]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
});
