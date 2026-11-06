import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BackButton, useChrome } from "@/components/ui/Chrome";
import { Spinner } from "@/components/ui/Controls";
import { Icon } from "@/components/ui/Icon";
import { Press } from "@/components/ui/Press";
import { ScreenStatusBar } from "@/components/ui/ScreenStatusBar";
import { Eyebrow, T } from "@/components/ui/Text";
import { useHeroStatusBar } from "@/hooks/useHeroStatusBar";
import { useAuthForm } from "@/lib/auth";
import { useTheme } from "@/theme/theme";
import { alpha, ease, fixed } from "@/theme/tokens";

type Props = {
  img: string;
  height: number;
  eyebrow: string;
  title: string;
  brand?: boolean;
  onBack?: () => void;
  gap?: number;
  children: ReactNode;
};

export function AuthScreen({
  img,
  height,
  eyebrow,
  title,
  brand,
  onBack,
  gap = 12,
  children,
}: Props) {
  const { c } = useTheme();
  const { floatTop, insets } = useChrome();
  const y = useSharedValue(0);
  const settle = useSharedValue(1.04);

  useEffect(() => {
    settle.set(withTiming(1, { duration: 560, easing: ease.sheet }));
  }, [settle]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.set(e.contentOffset.y);
    },
  });

  const barStyle = useHeroStatusBar(y, height - insets.top);
  const padBottom = Math.max(insets.bottom + 6, 24);

  const photo = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value < 0 ? y.value / 2 : y.value * 0.3 },
      { scale: settle.value * (y.value < 0 ? 1 + -y.value / height : 1) },
    ],
  }));

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenStatusBar style={barStyle} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ height, overflow: "hidden", backgroundColor: fixed.ink }}>
          <Animated.View style={[StyleSheet.absoluteFill, photo]}>
            <Image
              source={{ uri: img }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={260}
              cachePolicy="memory-disk"
            />
          </Animated.View>
          <LinearGradient
            colors={["rgba(20,16,12,0.4)", "rgba(20,16,12,0.05)", alpha(c.bg, 0.72), c.bg]}
            locations={[0, 0.35, 0.66, 1]}
            style={StyleSheet.absoluteFill}
          />
          {brand ? (
            <View style={[styles.brand, { top: floatTop + 8 }]}>
              <Icon name="local_fire_department" size={22} color={fixed.ember} fill />
              <T f="display" w={800} s={20} lh={1} ls={-0.02} c={fixed.cream}>
                Ember Kitchen
              </T>
            </View>
          ) : null}
          <View style={styles.headText}>
            <Eyebrow c="accentText">{eyebrow}</Eyebrow>
            <T f="display" w={800} s={38} lh={0.98} ls={-0.035}>
              {title}
            </T>
          </View>
        </View>
        <View style={{ flexGrow: 1 }}>
          <View style={[styles.body, { gap, paddingBottom: padBottom }]}>
            {children}
          </View>
        </View>
      </Animated.ScrollView>
      {onBack ? (
        <View style={[styles.back, { top: floatTop }]}>
          <BackButton tone="photo" size={44} onPress={onBack} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

export function AuthCta({
  label,
  busyLabel,
  busy,
  dim,
  onPress,
}: {
  label: string;
  busyLabel: string;
  busy: boolean;
  dim?: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const op = useSharedValue(dim ? 0.55 : 1);

  useEffect(() => {
    op.set(withTiming(dim ? 0.55 : 1, { duration: 200, easing: ease.out }));
  }, [dim, op]);

  const a = useAnimatedStyle(() => ({ opacity: op.value }));

  return (
    <Animated.View style={a}>
      <Press
        onPress={busy ? undefined : onPress}
        scaleTo={0.97}
        haptic="light"
        accessibilityLabel={busy ? busyLabel : label}
        style={[styles.cta, { backgroundColor: c.accent }]}
      >
        {busy ? <Spinner /> : null}
        <T w={700} s={16} c="accentInk">
          {busy ? busyLabel : label}
        </T>
      </Press>
    </Animated.View>
  );
}

export function PwToggle() {
  const showPw = useAuthForm((s) => s.showPw);

  return (
    <Press
      onPress={() => useAuthForm.getState().set({ showPw: !showPw })}
      scaleTo={0.94}
      haptic="selection"
      accessibilityLabel={showPw ? "Hide password" : "Show password"}
      style={styles.pwToggle}
    >
      <T w={600} s={12.5} c="text2">
        {showPw ? "Hide" : "Show"}
      </T>
    </Press>
  );
}

export function TextLink({
  onPress,
  children,
  style,
  label,
}: {
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  return (
    <Press
      onPress={onPress}
      scaleTo={0.96}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={style}
    >
      {children}
    </Press>
  );
}

export function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
}

const styles = StyleSheet.create({
  brand: { position: "absolute", left: 24, flexDirection: "row", alignItems: "center", gap: 6 },
  headText: { position: "absolute", left: 24, right: 24, bottom: 4, gap: 8 },
  body: { flex: 1, paddingTop: 14, paddingHorizontal: 24 },
  back: { position: "absolute", left: 16, zIndex: 3 },
  cta: {
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pwToggle: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});