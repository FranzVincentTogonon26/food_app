import { useIsFocused } from "expo-router";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";

/**
 * A screen's own status-bar style, applied only while that screen is focused.
 * The most recently mounted status bar wins, so an unconditional light bar on
 * a photo screen would stay light on every screen pushed above it; unmounting
 * on blur hands control back to the root layout's theme style.
 */
export function ScreenStatusBar({ style }: { style: StatusBarStyle }) {
  return useIsFocused() ? <StatusBar style={style} /> : null;
}
