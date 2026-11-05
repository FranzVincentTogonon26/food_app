import { useState } from "react";
import {
  useAnimatedReaction,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { useTheme } from "@/theme/theme";

/**
 * Status-bar style for screens that open on a dark photo or header: light over
 * the photo, then the theme's own style once the scroll offset `y` passes
 * `threshold` and the bar sits on the page colour.
 */
export function useHeroStatusBar(
  y: SharedValue<number>,
  threshold: number,
): "light" | "dark" {
  const { dark } = useTheme();
  const [pastHero, setPastHero] = useState(false);

  useAnimatedReaction(
    () => y.value > threshold,
    (past, prev) => {
      if (past !== prev) scheduleOnRN(setPastHero, past);
    },
  );

  return pastHero && !dark ? "dark" : "light";
}
