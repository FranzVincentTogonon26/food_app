import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
  Stack,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ToastHost } from "@/components/feedback/Toast";
import { useAccountSession } from "@/lib/accounts";
import "@/lib/remote";
import { useServerSync } from "@/lib/sync";
import { useSessionHydrated } from "@/store/sessions";
import { useHydrated } from "@/store/store";
import { fontAssets } from "@/theme/fonts";
import { ThemeProvider, useTheme } from "@/theme/theme";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const hydrated = useHydrated();
  const sessionHydrated = useSessionHydrated();
  const ready = (fontsLoaded || !!fontError) && hydrated && sessionHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavTheme>
          <AccountSync />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="welcome"
              options={{ animation: "fade", gestureEnabled: false }}
            />
            <Stack.Screen name="(auth)/login" options={{ animation: "fade" }} />
            <Stack.Screen name="(auth)/register" />
            <Stack.Screen name="(auth)/forgot" />
          </Stack>
          <ToastHost />
        </NavTheme>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/** The menu and account data. Runs after hydration. */
function AccountSync() {
  useAccountSession();
  useServerSync();
  return null;
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
