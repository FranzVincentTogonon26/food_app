import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavThemeProvider,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ToastHost } from "@/components/feedback/Toast";
import { fontAssets } from "@/theme/fonts";
import { ThemeProvider, useTheme } from "@/theme/theme";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavTheme>
          <Stack screenOptions={{ headerShown: false }} />
          <ToastHost />
        </NavTheme>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function NavTheme({ children }: { children: ReactNode }) {
  const { c, dark } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg);
  }, [c.bg]);

  const base = dark ? DarkTheme : DefaultTheme;

  return (
    <NavThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          background: c.bg,
          card: c.bg,
          primary: c.accent,
          text: c.text1,
          border: c.line,
        },
      }}
    >
      <StatusBar style={dark ? "light" : "dark"} />
      {children}
    </NavThemeProvider>
  );
}
