import { useEffect, type ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { alpha, ease } from "@/theme/tokens";
import { useTheme } from "@/theme/theme";

import { Icon } from "./Icon";
import { Press, type HapticKind } from "./Press";
import { T } from "./Text";

/** Animated 0→1 follower for a boolean, using the given duration/curve. */
function useOn(on: boolean, duration = 300, easing = ease.spring) {
  const v = useSharedValue(on ? 1 : 0);

  useEffect(() => {
    v.set(withTiming(on ? 1 : 0, { duration, easing }));
  }, [on, v, duration, easing]);

  return v;
}

export function Switch({
  on,
  style,
}: {
  on: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const knob = useOn(on, 300, ease.spring);
  const track = useOn(on, 250, ease.out);

  const tStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(track.value, [0, 1], [
      c.surface2,
      c.accent,
    ]),
  }));

  const kStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: knob.value * 20 }],
    backgroundColor: interpolateColor(track.value, [0, 1], [
      c.text3,
      c.accentInk,
    ]),
  }));

  return (
    <Animated.View style={[styles.track, tStyle, style]}>
      <Animated.View style={[styles.knob, kStyle]} />
    </Animated.View>
  );
}

/** 20px radio ring with a 10px dot that springs in. */
export function Radio({ on, size = 20 }: { on: boolean; size?: number }) {
  const { c } = useTheme();
  const v = useOn(on, 300, ease.spring);

  const dot = useAnimatedStyle(() => ({ transform: [{ scale: v.value }] }));

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: on ? c.accent : c.lineStrong,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={[
          { width: 10, height: 10, borderRadius: 5, backgroundColor: c.accent },
          dot,
        ]}
      />
    </View>
  );
}

/** 24px rounded checkbox (extras, kitchen tickets, terms). */
export function Check({
  on,
  size = 24,
  radius = 8,
}: {
  on: boolean;
  size?: number;
  radius?: number;
}) {
  const { c } = useTheme();
  const v = useOn(on, 200, ease.out);

  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], [
      "rgba(0,0,0,0)",
      c.accent,
    ]),
    borderColor: interpolateColor(v.value, [0, 1], [c.lineStrong, c.accent]),
  }));

  const tick = useAnimatedStyle(() => ({ opacity: v.value }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: 1.5,
          alignItems: "center",
          justifyContent: "center",
        },
        box,
      ]}
    >
      <Animated.View style={tick}>
        <Icon name="check" size={size - 6} color={c.accentInk} />
      </Animated.View>
    </Animated.View>
  );
}

export function Spinner({
  color,
  size = 18,
}: {
  color?: string;
  size?: number;
}) {
  const { c } = useTheme();
  const r = useSharedValue(0);

  useEffect(() => {
    r.set(
      withRepeat(
        withTiming(1, { duration: 700, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, [r]);

  const a = useAnimatedStyle(() => ({
    transform: [{ rotate: `${r.value * 360}deg` }],
  }));

  const col = color ?? c.accentInk;

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2.5,
          borderColor: col,
          borderRightColor: "transparent",
        },
        a,
      ]}
    />
  );
}

type ChipProps = {
  label: string;
  on: boolean;
  onPress: () => void;
  icon?: string;
  height?: number;
  /** horizontal padding */
  px?: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
  right?: ReactNode;
  font?: "body" | "display";
  weight?: 600 | 700 | 800;
};

/** Selectable pill: accent fill when on, surface + hairline when off. */
export function Chip({
  label,
  on,
  onPress,
  icon,
  height = 40,
  px = 16,
  size = 14,
  style,
  right,
  font = "body",
  weight = 600,
}: ChipProps) {
  const { c } = useTheme();
  const v = useOn(on, 250, ease.out);

  const a = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], [c.surface1, c.accent]),
    borderColor: interpolateColor(v.value, [0, 1], [c.line, c.accent]),
  }));

  const fg = on ? c.accentInk : c.text1;

  return (
    <Press
      onPress={onPress}
      scaleTo={0.94}
      haptic="selection"
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
    >
      <Animated.View
        style={[
          {
            height,
            paddingLeft: icon ? px - 4 : px,
            paddingRight: right ? 6 : px,
            borderRadius: height / 2,
            borderWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          },
          a,
          style,
        ]}
      >
        {icon ? <Icon name={icon} size={size + 3} color={fg} /> : null}
        <T f={font} w={weight} s={size} c={fg}>
          {label}
        </T>
        {right}
      </Animated.View>
    </Press>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: string;
  iconFill?: boolean;
  /**
   * primary: accent
   * ink: text-1 on bg
   * outline: hairline
   * danger: hairline + err text
   * soft: surface
   */
  variant?: "primary" | "ink" | "outline" | "danger" | "soft";
  height?: number;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  /** visually dimmed but still pressable (opacity .55 for "not ready") */
  dim?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: number;
  right?: ReactNode;
  haptic?: HapticKind;
  shadow?: boolean;
};

export function Button({
  label,
  onPress,
  icon,
  iconFill = true,
  variant = "primary",
  height = 56,
  loading,
  loadingLabel,
  disabled,
  dim,
  style,
  size = 16,
  right,
  haptic = "light",
  shadow,
}: ButtonProps) {
  const { c } = useTheme();

  const bg = {
    primary: c.accent,
    ink: c.text1,
    outline: "transparent",
    danger: "transparent",
    soft: c.surface1,
  }[variant];

  const fg = {
    primary: c.accentInk,
    ink: c.bg,
    outline: c.text1,
    danger: c.err,
    soft: c.text1,
  }[variant];

  const border =
    variant === "outline" || variant === "danger"
      ? c.lineStrong
      : variant === "soft"
        ? c.line
        : "transparent";

  return (
    <Press
      onPress={loading ? undefined : onPress}
      disabled={disabled}
      scaleTo={0.97}
      haptic={haptic}
      style={[
        {
          height,
          borderRadius: height / 2,
          backgroundColor: bg,
          borderWidth: border === "transparent" ? 0 : 1,
          borderColor: border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: right ? "space-between" : "center",
          gap: 10,
          paddingHorizontal: right ? 0 : 20,
          paddingLeft: right ? 24 : 20,
          paddingRight: right ? 10 : 20,
          opacity: dim || disabled ? 0.55 : 1,
        },
        shadow && variant === "primary"
          ? {
              shadowColor: c.accent,
              shadowOpacity: 0.3,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 12 },
              elevation: 6,
            }
          : null,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.row}>
          <Spinner color={fg} />
          <T w={700} s={size} c={fg}>
            {loadingLabel ?? label}
          </T>
        </View>
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Icon
              name={icon}
              size={size + 4}
              color={fg}
              fill={iconFill ? 1 : 0}
            />
          ) : null}
          <T w={variant === "outline" ? 600 : 700} s={size} c={fg}>
            {label}
          </T>
        </View>
      )}
      {right}
    </Press>
  );
}

/** - n + quantity control on a surface-2 well. */
export function Stepper({
  value,
  onDec,
  onInc,
  size = 32,
  font = 14,
  minWidth = 22,
}: {
  value: number | string;
  onDec: () => void;
  onInc: () => void;
  size?: number;
  font?: number;
  minWidth?: number;
}) {
  const { c } = useTheme();
  const pad = size >= 42 ? 4 : 3;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        padding: pad,
        borderRadius: (size + pad * 2) / 2,
        backgroundColor: c.surface2,
      }}
    >
      <Press
        onPress={onDec}
        scaleTo={0.88}
        haptic="selection"
        accessibilityLabel="Less"
        style={[
          styles.stepBtn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: c.surface1,
          },
        ]}
      >
        <Icon name="remove" size={size >= 42 ? 20 : 18} />
      </Press>
      <T w={700} s={font} center style={{ minWidth }}>
        {value}
      </T>
      <Press
        onPress={onInc}
        scaleTo={0.88}
        haptic="selection"
        accessibilityLabel="More"
        style={[
          styles.stepBtn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: c.surface1,
          },
        ]}
      >
        <Icon name="add" size={size >= 42 ? 20 : 18} />
      </Press>
    </View>
  );
}

/** Small uppercase status pill on a 15% tint of its colour. */
export function StatusPill({
  label,
  color,
  size = 10,
}: {
  label: string;
  color: string;
  size?: number;
}) {
  const { c } = useTheme();
  const col = (c as Record<string, string>)[color] ?? color;

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 7,
        backgroundColor: alpha(col, 0.15),
      }}
    >
      <T w={700} s={size} ls={0.05} upper c={col} numberOfLines={1}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: 48, height: 28, borderRadius: 14, padding: 3 },
  knob: { width: 22, height: 22, borderRadius: 11 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: { alignItems: "center", justifyContent: "center" },
});
