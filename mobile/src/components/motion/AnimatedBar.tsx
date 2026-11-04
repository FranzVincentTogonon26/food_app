import { useEffect } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { ease } from "@/theme/tokens";

/**
 * A fill whose width (0-100%) animates - progress bars, chart columns
 * (use `vertical`), timeline lines.
 * Grows its width over 600-900ms on the default ease-out
 * (cubic-bezier(.2,.8,.2,1)).
 */
export function AnimatedFill({
  pct,
  color,
  duration = 600,
  delay = 0,
  vertical,
  radius,
  style,
}: {
  pct: number;
  color: string;
  duration?: number;
  delay?: number;
  vertical?: boolean;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.set(
      withDelay(
        delay,
        withTiming(Math.max(0, Math.min(100, pct)), {
          duration,
          easing: ease.out,
        }),
      ),
    );
  }, [pct, v, duration, delay]);

  const a = useAnimatedStyle(() =>
    vertical ? { height: `${v.value}%` } : { width: `${v.value}%` },
  );

  return (
    <Animated.View
      style={[
        { backgroundColor: color, borderRadius: radius },
        vertical ? { width: "100%" } : { height: "100%" },
        style,
        a,
      ]}
    />
  );
}
