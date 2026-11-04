import { Easing } from "react-native-reanimated";

export const light = {
  bg: "#F7F3EE",
  surface1: "#FFFFFF",
  surface2: "#EFE8DF",

  line: "rgba(31,27,22,0.08)",
  lineStrong: "rgba(31,27,22,0.16)",

  glass: "rgba(255,255,255,0.62)",
  glassStrong: "rgba(255,252,248,0.84)",
  glassLine: "rgba(31,27,22,0.08)",

  navGlass: "rgba(255,255,255,0.46)",
  navHi: "rgba(255,255,255,0.95)",
  navLo: "rgba(31,27,22,0.08)",
  navPill: "rgba(226,83,26,0.12)",
  navPillHi: "rgba(255,255,255,0.75)",

  text1: "#1F1B16",
  text2: "#5E574F",
  text3: "#7D746A",

  scrim: "rgba(31,27,22,0.38)",

  ok: "#1F8A55",
  warn: "#A86A12",
  err: "#C93434",
  info: "#2563B8",

  accent: "#E2531A",
  accentInk: "#FFFFFF",
  accentText: "#B8400F",
  accentSoft: "rgba(226,83,26,0.12)",

  shadow: "#1F1B16",
};

export type Palette = typeof light;

export const dark: Palette = {
  bg: "#141210",
  surface1: "#1E1B18",
  surface2: "#2A2622",

  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.16)",

  glass: "rgba(30,27,24,0.58)",
  glassStrong: "rgba(22,20,18,0.82)",
  glassLine: "rgba(255,255,255,0.12)",

  navGlass: "rgba(42,38,34,0.42)",
  navHi: "rgba(255,255,255,0.22)",
  navLo: "rgba(0,0,0,0.35)",
  navPill: "rgba(255,255,255,0.12)",
  navPillHi: "rgba(255,255,255,0.2)",

  text1: "#F5EFE8",
  text2: "#B5ACA1",
  text3: "#8F867B",

  scrim: "rgba(0,0,0,0.55)",

  ok: "#4CD98A",
  warn: "#F5B93A",
  err: "#FF6B6B",
  info: "#62A8FF",

  accent: "#FF6B2C",
  accentInk: "#1A0A02",
  accentText: "#FF8A52",
  accentSoft: "rgba(255,107,44,0.14)",

  shadow: "#000000",
};

export const fixed = {
  ink: "#1F1B16",
  ink2: "#2E2924",
  cream: "#F5EFE8",
  creamDim: "rgba(245,239,232,0.72)",

  ember: "#FF6B2C",
  emberText: "#FF8A52",
  emberInk: "#1A0A02",

  star: "#F5A524",
  splash: "#120F0C",
  photoScrim: "rgba(20,16,12,0.38)",
  white: "#FFFFFF",
};

export const ease = {
  /** cubic-bezier(.2,.8,.2,1) - default ease-out */
  out: Easing.bezier(0.2, 0.8, 0.2, 1),
  /** cubic-bezier(.34,1.56,.64,1) - springy overshoot */
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** cubic-bezier(.7,0,.2,1) - in-out */
  inOut: Easing.bezier(0.7, 0, 0.2, 1),
  /** cubic-bezier(.2,.9,.1,1) - strong out */
  strongOut: Easing.bezier(0.2, 0.9, 0.1, 1),
  /** cubic-bezier(.32,.72,0,1) - iOS sheet curve */
  sheet: Easing.bezier(0.32, 0.72, 0, 1),
};

/**
 * Convert '#RRGGBB' to rgba with the given alpha
 * (a translucent tint of a palette colour).
 */
export function alpha(color: string, a: number): string {
  if (color.startsWith("#") && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
    return `rgba(${r},${g},${b},${a})`;
  }

  return color;
}
