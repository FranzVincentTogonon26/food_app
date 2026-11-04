import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/** '@keyframes ek-pulse' - a live dot with an expanding, fading ring. */
export function PulseDot({
  color,
  size = 10,
  duration = 1600,
}: {
  color: string;
  size?: number;
  duration?: number;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.set(
      withRepeat(
        withTiming(1, { duration, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
  }, [p, duration]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.85 * (1 - p.value),
    transform: [{ scale: 1 + 1.4 * p.value }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          ring,
        ]}
      />
    </View>
  );
}
