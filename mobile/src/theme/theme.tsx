import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { useApp } from "@/store/store";
import { dark as darkPalette, light as lightPalette, type Palette } from "./tokens";

type ThemeValue = { c: Palette; dark: boolean };

const ThemeContext = createContext<ThemeValue>({
  c: lightPalette,
  dark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pref = useApp((s) => s.theme);
  const system = useColorScheme();

  const isDark =
    (pref ?? (system === "dark" ? "dark" : "light")) === "dark";

  const value = useMemo(
    () => ({ c: isDark ? darkPalette : lightPalette, dark: isDark }),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);