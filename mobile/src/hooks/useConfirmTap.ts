import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";

import { haptic } from "@/components/ui/Press";

/**
 * Two-tap guard for irreversible actions (cancel & refund, cancel a booking,
 * deletes, demo reset). The first tap arms it - callers swap the label to a
 * "tap again" prompt - and a second tap within `ms` runs `action`; otherwise it
 * quietly disarms. Works the same on iOS, Android and web, unlike `Alert`.
 */
export function useConfirmTap(action: () => void, prompt: string, ms = 3000) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onPress = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (armed) {
      setArmed(false);
      action();
      return;
    }
    haptic("light");
    AccessibilityInfo.announceForAccessibility(prompt);
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), ms);
  }, [armed, action, prompt, ms]);

  return { armed, onPress };
}
