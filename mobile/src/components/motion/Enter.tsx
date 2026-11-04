import { useNavigation, useRoute } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { ease } from "@/theme/tokens";

/**
 * Entrance choreography: every screen section fades up 18px (opacity over 500ms,
 * movement over 640ms on "cubic-bezier(.2,.8,.2,1)"), with a 55ms stagger after
 * a 60ms base delay. Tabs replay it whenever they become the active tab; pushed
 * screens play it on mount.
 */
type EnterCtx = { gen: number; replay: () => void };
const Ctx = createContext<EnterCtx>({ gen: 1, replay: () => {} });

export const useEnterScope = () => useContext(Ctx);

/** Play on mount (pushed screens, sheets). */
export function EnterOnMount({ children }: { children: ReactNode }) {
  const [gen, setGen] = useState(1);
  const replay = useCallback(() => setGen((g) => g + 1), []);

  return <Ctx.Provider value={{ gen, replay }}>{children}</Ctx.Provider>;
}

/** Last tab focused in each tab navigator & screen popping back. */
const lastTab = new Map<string, string>();

/**
 * Tab scene transition + section entrances. Every time this tab becomes the
 * selected tab the whole scene fades in from 14px lower and slightly smaller
 * (opacity over 360ms, movement over 520ms) and the sections re-stagger;
 * returning from a pushed screen does neither. Driven by the screen's own focus
 * event on the UI thread, so a tab selected while the navigator is covered
 * (e.g. "View cart" from a detail screen) can never be left hidden.
 */
export function EnterOnTabFocus({ children }: { children: ReactNode }) {
  const navigation = useNavigation();
  const route = useRoute();
  const reduced = useReducedMotion();
  const [gen, setGen] = useState(() => (navigation.isFocused() ? 1 : 0));
  const replay = useCallback(() => setGen((g) => g + 1), []);
  const op = useSharedValue(0);
  const tr = useSharedValue(0);

  useEffect(() => {
    const navKey = navigation.getState()?.key ?? "tabs";
    if (navigation.isFocused()) lastTab.set(navKey, route.key);

    return navigation.addListener("focus", () => {
      const prev = lastTab.get(navKey);
      lastTab.set(navKey, route.key);
      if (prev !== route.key) setGen((g) => g + 1);
    });
  }, [navigation, route.key]);

  useEffect(() => {
    if (gen === 0) return;

    if (reduced) {
      op.set(1);
      tr.set(1);
      return;
    }

    op.set(0);
    tr.set(0);
    op.set(withTiming(1, { duration: 360, easing: ease.out }));
    tr.set(withTiming(1, { duration: 520, easing: ease.out }));
  }, [gen, reduced, op, tr]);

  const scene = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [
      { translateY: 14 * (1 - tr.value) },
      { scale: 0.985 + 0.015 * tr.value },
    ],
  }));

  return (
    <Ctx.Provider value={{ gen, replay }}>
      <Animated.View style={[{ flex: 1 }, scene]}>{children}</Animated.View>
    </Ctx.Provider>
  );
}

type From = { x?: number; y?: number; scale?: number };

type StaggerProps = {
  /** stagger index - delay = 60 + i * 55ms */
  i?: number;
  from?: From;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  delay?: number;
  pointerEvents?: "auto" | "none" | "box-none" | "box-only";
};

export function Stagger({
  i = 0,
  from,
  style,
  children,
  delay = 0,
  pointerEvents,
}: StaggerProps) {
  const { gen } = useContext(Ctx);
  const reduced = useReducedMotion();
  const fx = from?.x ?? 0;
  const fy = from?.y ?? (from?.x != null ? 0 : 18);
  const fs = from?.scale ?? 1;
  const op = useSharedValue(0);
  const tr = useSharedValue(0);

  // Only a new scope generation (focus / replay) or a fresh mount plays the
  // entrance; an item whose index shifts inside a changing list must not blink
  // back to 0.
  const played = useRef(0);

  useEffect(() => {
    if (gen === 0 || played.current === gen) return;
    played.current = gen;

    if (reduced) {
      op.set(1);
      tr.set(1);
      return;
    }

    const d = 60 + i * 55 + delay;
    op.set(0);
    tr.set(0);
    op.set(withDelay(d, withTiming(1, { duration: 500, easing: ease.out })));
    tr.set(withDelay(d, withTiming(1, { duration: 640, easing: ease.out })));
  }, [gen, i, delay, reduced, op, tr]);

  const a = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [
      { translateX: fx * (1 - tr.value) },
      { translateY: fy * (1 - tr.value) },
      { scale: fs + (1 - fs) * tr.value },
    ],
  }));

  return (
    <Animated.View style={[style, a]} pointerEvents={pointerEvents}>
      {children}
    </Animated.View>
  );
}
