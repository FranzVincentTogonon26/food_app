import { Dimensions, type View } from "react-native";
import { create } from "zustand";

export type ToastData = {
  id: number;
  title: string;
  sub: string;
  icon: string;
  action?: string;
  onAction?: () => void;
};

type Point = { x: number; y: number };

export type FlyData = {
  id: number;
  from: Point;
  to: Point;
  onDone: () => void;
};

type FeedbackState = {
  toast: ToastData | null;
  fly: FlyData | null;
  /** increments every time something lands in the cart - badges pop */
  bump: number;
};

export const useFeedback = create<FeedbackState>(() => ({
  toast: null,
  fly: null,
  bump: 0,
}));

let seq = 0;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

/** Glass toast from the top - auto-dismisses after 2.6s. */
export function toast(
  title: string,
  sub = "",
  opts: { icon?: string; action?: string; onAction?: () => void } = {},
) {
  clearTimeout(hideTimer);
  useFeedback.setState({
    toast: {
      id: ++seq,
      title,
      sub,
      icon: opts.icon ?? "check",
      action: opts.action,
      onAction: opts.onAction,
    },
  });
  hideTimer = setTimeout(() => useFeedback.setState({ toast: null }), 2600);
}

export function hideToast() {
  clearTimeout(hideTimer);
  useFeedback.setState({ toast: null });
}

export const bumpCart = () =>
  useFeedback.setState((s) => ({ bump: s.bump + 1 }));

const targets: { current: View | null }[] = [];

/**
 * Register a cart icon as the fly-to-cart destination. Most recent registration
 * wins.
 */
export function registerCartTarget(ref: { current: View | null }) {
  targets.push(ref);
  return () => {
    const i = targets.lastIndexOf(ref);
    if (i >= 0) targets.splice(i, 1);
  };
}

function measure(
  v: View | null | undefined,
): Promise<{ x: number; y: number; w: number; h: number } | null> {
  return new Promise((resolve) => {
    if (!v || typeof v.measureInWindow !== "function") return resolve(null);
    v.measureInWindow((x, y, w, h) => resolve(w || h ? { x, y, w, h } : null));
  });
}

/**
 * Launch the "+1" bubble from source to the active cart target; `onDone` fires
 * on landing.
 */
export async function flyToCart(
  source: View | null | undefined,
  onDone: () => void,
) {
  const target = targets[targets.length - 1]?.current;
  const [a, b] = await Promise.all([measure(source), measure(target)]);

  // The tab bar slides off-screen while the keyboard is up - just land without
  // the arc (screen, not window: on Android the window height excludes the
  // edge-to-edge system bars).
  if (!a || !b || b.y > Dimensions.get("screen").height) return onDone();

  useFeedback.setState({
    fly: {
      id: ++seq,
      from: { x: a.x + a.w / 2, y: a.y + a.h / 2 },
      to: { x: b.x + b.w / 2, y: b.y + b.h / 2 },
      onDone,
    },
  });
}
