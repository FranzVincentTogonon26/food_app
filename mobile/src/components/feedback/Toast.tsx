import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { useChrome } from "@/components/ui/Chrome";
import { Glass } from "@/components/ui/Glass";
import { Icon } from "@/components/ui/Icon";
import { Press, haptic } from "@/components/ui/Press";
import { T } from "@/components/ui/Text";
import { hideToast, useFeedback, type ToastData } from "@/store/feedback";
import { ease } from "@/theme/tokens";
import { useTheme } from "@/theme/theme";

/**
 * Top toast - springs down (transform 480ms cubic-bezier(.34,1.56),
 * opacity 300ms).
 * Swipe up to dismiss.
 */
export function ToastHost() {
  const data = useFeedback((s) => s.toast);
  const { c } = useTheme();
  const { floatTop } = useChrome();
  const [shown, setShown] = useState<ToastData | null>(data);

  // keep the last toast rendered while it animates out
  if (data && data !== shown) setShown(data);

  const y = useSharedValue(-160);
  const op = useSharedValue(0);

  useEffect(() => {
    if (data) {
      y.set(-160);
      y.set(withTiming(0, { duration: 480, easing: ease.spring }));
      op.set(withTiming(1, { duration: 300, easing: ease.out }));
    } else {
      y.set(withTiming(-160, { duration: 420, easing: ease.out }));
      op.set(withTiming(0, { duration: 300, easing: ease.out }));
    }
  }, [data, y, op]);

  const pan = Gesture.Pan()
    .activeOffsetY(-6)
    .onChange((e) => {
      y.set(Math.min(0, y.value + e.changeY));
    })
    .onEnd((e) => {
      if (y.value < -24 || e.velocityY < -400) scheduleOnRN(hideToast);
      else y.set(withTiming(0, { duration: 260, easing: ease.out }));
    });

  const a = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: y.value }],
  }));

  if (!shown) return null;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        pointerEvents={data ? "auto" : "none"}
        style={[styles.wrap, { top: floatTop, shadowColor: c.shadow }, a]}
      >
        <Glass
          variant="strong"
          style={[styles.card, { borderColor: c.glassLine }]}
        >
          <View style={[styles.icon, { backgroundColor: c.accent }]}>
            <Icon name={shown.icon} size={20} color="accentInk" fill={1} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <T w={700} s={14} numberOfLines={1}>
              {shown.title}
            </T>
            {shown.sub ? (
              <T s={12.5} c="text2" numberOfLines={1}>
                {shown.sub}
              </T>
            ) : null}
          </View>
          {shown.action ? (
            <Press
              onPress={() => {
                haptic("light");
                hideToast();
                shown.onAction?.();
              }}
              scaleTo={0.94}
              style={[styles.action, { backgroundColor: c.text1 }]}
            >
              <T w={700} s={13} c="bg">
                {shown.action}
              </T>
            </Press>
          ) : null}
        </Glass>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 14,
    right: 14,
    zIndex: 85,
    borderRadius: 20,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 10,
    paddingRight: 10,
    paddingLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  action: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: "center",
  },
});
