import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import {
  Pressable,
  type AccessibilityActionEvent,
  type AccessibilityActionInfo,
  type GestureResponderEvent,
  type Insets,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ease } from "@/theme/tokens";

const APressable = Animated.createAnimatedComponent(Pressable);

export type HapticKind = "light" | "medium" | "selection" | "success" | "none";

export function haptic(kind: HapticKind = "light") {
  if (process.env.EXPO_OS === "web") return;

  switch (kind) {
    case "light":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case "medium":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case "selection":
      return Haptics.selectionAsync();
    case "success":
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export type PressProps = {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  /** scale while pressed; Ember uses .88–.98 */
  scaleTo?: number;
  haptic?: HapticKind;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  hitSlop?: number | Insets;
  accessibilityLabel?: string;
  accessibilityRole?:
    | "button"
    | "link"
    | "tab"
    | "checkbox"
    | "switch"
    | "radio"
    | "none";
  accessibilityState?: {
    selected?: boolean;
    checked?: boolean;
    disabled?: boolean;
  };
  /**
   * secondary actions for screen readers when a control is nested inside this one
   * (swipe up/down on iOS)
   */
  accessibilityActions?: readonly AccessibilityActionInfo[];
  onAccessibilityAction?: (e: AccessibilityActionEvent) => void;
  testID?: string;
};

export function Press({
  onPress,
  onLongPress,
  scaleTo = 0.96,
  haptic: h = "none",
  disabled,
  style,
  children,
  hitSlop,
  accessibilityLabel,
  accessibilityRole = "button",
  accessibilityState,
  accessibilityActions,
  onAccessibilityAction,
  testID,
}: PressProps) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <APressable
      testID={testID}
      hitSlop={hitSlop}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, ...accessibilityState }}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      onPressIn={() => {
        s.set(withTiming(scaleTo, { duration: 150, easing: ease.out }));
      }}
      onPressOut={() => {
        s.set(withTiming(1, { duration: 220, easing: ease.out }));
      }}
      onPress={(e) => {
        if (h !== "none") haptic(h);
        onPress?.(e);
      }}
      onLongPress={onLongPress}
      style={[style, a]}
    >
      {children}
    </APressable>
  );
}
