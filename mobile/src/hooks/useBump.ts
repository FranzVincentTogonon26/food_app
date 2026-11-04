import { useEffect, useRef } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useFeedback } from "@/store/feedback";
import { ease } from "@/theme/tokens";

/**
 * Cart badge pop: scale 1 → 1.45 → 1 with the springy curve whenever an item
 * lands.
 */
export function useBumpStyle() {
  const bump = useFeedback((s) => s.bump);
  const first = useRef(true);
  const sc = useSharedValue(1);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sc.set(
      withSequence(
        withTiming(1.45, { duration: 160, easing: ease.out }),
        withTiming(1, { duration: 260, easing: ease.spring }),
      ),
    );
  }, [bump, sc]);

  return useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
}

/** Heart pop: scale 1 → 1.35 → 1 (280ms springy) when `on` flips. */
export function usePopStyle(on: boolean, peak = 1.35) {
  const first = useRef(true);
  const sc = useSharedValue(1);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sc.set(
      withSequence(
        withTiming(peak, { duration: 140, easing: ease.out }),
        withTiming(1, { duration: 280, easing: ease.spring }),
      ),
    );
  }, [on, peak, sc]);

  return useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
}
