import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fixed } from "@/theme/tokens";
import { useTheme } from "@/theme/theme";

import { Glass } from "./Glass";
import { Icon } from "./Icon";
import { Press } from "./Press";
import { T } from "./Text";

/**
 * Layout offsets that follow the device's safe areas (status bar, notch, home
 * indicator), so floating buttons, headers and scroll padding sit in the same
 * place on every phone.
 */
export function useChrome() {
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top, 20);

  return {
    insets,
    /** top of floating buttons over photos */
    floatTop: top + 7,
    /** top padding of a tab screen's scroll content */
    tabTop: top + 11,
    headerTop: top + 65,
    /** bottom of floating bars */
    floatBottom: Math.max(insets.bottom - 10, 14),
    /** scroll padding under a floating CTA bar */
    barPad: Math.max(insets.bottom - 10, 14) + 106,
    /** scroll padding under the tab bar */
    tabPad: Math.max(insets.bottom - 10, 14) + 106,
  };
}

type CircleProps = {
  /** omit to render only children (e.g. an animated icon) */
  icon?: string;
  onPress?: () => void;
  tone?: "photo" | "surface" | "ink";
  size?: number;
  iconSize?: number;
  color?: string;
  fill?: boolean;
  label?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function CircleButton({
  icon,
  onPress,
  tone = "surface",
  size = 44,
  iconSize = 22,
  color,
  fill,
  label,
  children,
  style,
}: CircleProps) {
  const { c } = useTheme();

  const base: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: "center",
    justifyContent: "center",
  };

  const inner = (
    <>
      {icon ? (
        <Icon
          name={icon}
          size={iconSize}
          color={color ?? (tone === "surface" ? c.text1 : fixed.cream)}
          fill={fill ? 1 : 0}
        />
      ) : null}
      {children}
    </>
  );

  if (tone === "photo") {
    return (
      <Press
        onPress={onPress}
        scaleTo={0.9}
        haptic="light"
        accessibilityLabel={label}
        style={[base, style]}
      >
        <Glass
          variant="photo"
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: size / 2,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.22)",
            },
          ]}
        />
        {inner}
      </Press>
    );
  }

  return (
    <Press
      onPress={onPress}
      scaleTo={0.9}
      haptic="light"
      accessibilityLabel={label}
      style={[
        base,
        tone === "ink"
          ? {
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.18)",
              backgroundColor: "rgba(255,255,255,0.08)",
            }
          : {
              borderWidth: 1,
              borderColor: c.line,
              backgroundColor: c.surface1,
            },
        style,
      ]}
    >
      {inner}
    </Press>
  );
}

export function BackButton({
  tone = "surface",
  size = 42,
  onPress,
}: {
  tone?: CircleProps["tone"];
  size?: number;
  onPress?: () => void;
}) {
  return (
    <CircleButton
      icon="arrow_back"
      tone={tone}
      size={size}
      label="Back"
      onPress={
        onPress ??
        (() => (router.canGoBack() ? router.back() : router.replace("/")))
      }
    />
  );
}

export function GlassHeader({
  title,
  right,
  onBack,
  back = true,
}: {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
  back?: boolean;
}) {
  const { c } = useTheme();
  const { insets } = useChrome();

  return (
    <Glass
      variant="strong"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 3,
        paddingTop: Math.max(insets.top, 20) + 5,
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth * 2,
        borderBottomColor: c.glassLine,
      }}
    >
      {back ? <BackButton onPress={onBack} /> : null}
      <T
        f="display"
        w={800}
        s={20}
        ls={-0.02}
        style={{ flex: 1 }}
        numberOfLines={1}
      >
        {title}
      </T>
      {right}
    </Glass>
  );
}

export function BottomBar({
  children,
  style,
  contentStyle,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const { floatBottom } = useChrome();

  return (
    <View
      style={[
        {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: floatBottom,
          zIndex: 3,
          borderRadius: 32,
          shadowColor: c.shadow,
          shadowOpacity: 0.16,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 20 },
          elevation: 12,
        },
        style,
      ]}
    >
      <Glass
        variant="strong"
        style={[
          {
            borderRadius: 32,
            padding: 8,
            borderWidth: 1,
            borderColor: c.glassLine,
          },
          contentStyle,
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderTopWidth: 1,
              borderTopColor: c.navHi,
              borderRadius: 32,
              opacity: 0.9,
            },
          ]}
        />
        {children}
      </Glass>
    </View>
  );
}
