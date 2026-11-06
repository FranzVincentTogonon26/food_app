import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
  type WithTimingConfig,
} from "react-native-reanimated";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";

import { Button } from "@/components/ui/Controls";
import { Press } from "@/components/ui/Press";
import { T } from "@/components/ui/Text";
import { OB } from "@/store/constants";
import { useApp } from "@/store/store";

type Slide = {
  img: string;
  eb: string;
  t: string;
  t2?: string;
  sub: string;
};

const SLIDES: readonly Slide[] = OB;

const TINTS = ["#17100B", "#0D1512", "#0C0F16"];

const TIMING: WithTimingConfig = {
  duration: 520,
  easing: Easing.out(Easing.cubic),
};

function animate(value: SharedValue<number>, to: number, reduced: boolean) {
  value.value = withTiming(to, {
    ...TIMING,
    duration: reduced ? 0 : TIMING.duration,
  });
}

function Backdrop({ uri, active }: { uri: string; active: boolean }) {
  const reduced = useReducedMotion();
  const fade = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(active ? 1 : 1.06);

  useEffect(() => {
    animate(fade, active ? 1 : 0, reduced);
    animate(scale, active ? 1 : 1.06, reduced);
  }, [active, fade, reduced, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={0}
      />
      <LinearGradient
        colors={["rgba(8,7,6,0.08)", "rgba(8,7,6,0.38)", "rgba(8,7,6,0.94)"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="ember-glow" cx="50%" cy="40%" r="72%">
            <Stop offset="0" stopColor="#FF6B2C" stopOpacity={0.2} />
            <Stop offset="0.55" stopColor="#FF6B2C" stopOpacity={0.06} />
            <Stop offset="1" stopColor="#080706" stopOpacity={0.5} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#ember-glow)" />
      </Svg>
    </Animated.View>
  );
}

export default function Welcome() {
  const { width, height } = useSafeAreaFrame();
  const reduced = useReducedMotion();
  const finishOnboarding = useApp((s) => s.finishOnboarding);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  const reveal = useSharedValue(0);

  useEffect(() => {
    reveal.value = 0;
    reveal.value = withDelay(
      reduced ? 0 : 90,
      withTiming(1, {
        ...TIMING,
        duration: reduced ? 0 : 520,
      }),
    );
  }, [index, reduced, reveal]);

  useEffect(() => {
    if (paused || reduced || index >= SLIDES.length - 1) return;
    timer.current = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
    }, 6500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, reduced]);

  const goTo = (next: number) => {
    setPaused(true);
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  };

  const finish = () => {
    setPaused(true);
    finishOnboarding();
    router.replace("/");
  };

  const next = () => {
    if (last) finish();
    else goTo(index + 1);
  };

  const swipe = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .onEnd((e) => {
      if (e.translationX <= -48) scheduleOnRN(goTo, index + 1);
      else if (e.translationX >= 48) scheduleOnRN(goTo, index - 1);
    });

  const copyStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * 18 }],
  }));

  return (
    <View style={styles.screen}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: TINTS[index] }]} />
      {SLIDES.map((item, i) => (
        <Backdrop key={item.img} uri={item.img} active={i === index} />
      ))}

      <GestureDetector gesture={swipe}>
        <View style={styles.contentWrap}>
          <View
            style={[
              styles.content,
              {
                paddingTop: Math.max(52, height * 0.07),
                paddingBottom: Math.max(28, height * 0.045),
                maxWidth: Math.min(520, width - 40),
              },
            ]}
          >
            <View style={styles.top}>
              <View style={styles.brand}>
                <View style={styles.brandDot} />
                <T w={700} s={11} ls={0.18} upper c="rgba(255,255,255,0.7)">
                  Ember Kitchen
                </T>
              </View>
              {!last ? (
                <Press onPress={finish} hitSlop={12} accessibilityLabel="Skip">
                  <T w={600} s={13} c="rgba(255,255,255,0.7)">
                    Skip
                  </T>
                </Press>
              ) : null}
            </View>

            <Animated.View style={copyStyle}>
              <T w={700} s={11} ls={0.18} upper c="#FFB27A">
                {slide.eb}
              </T>
              <T
                f="display"
                w={800}
                s={44}
                lh={1.02}
                ls={-0.035}
                c="#FFFFFF"
                style={{ marginTop: 10 }}
              >
                {slide.t}
                {slide.t2 ? `\n${slide.t2}` : ""}
              </T>
              <T
                s={15.5}
                lh={1.45}
                c="rgba(255,255,255,0.72)"
                style={{ marginTop: 14, maxWidth: 330 }}
              >
                {slide.sub}
              </T>
            </Animated.View>

            <View style={styles.bottom}>
              <View style={styles.dots}>
                {SLIDES.map((item, i) => (
                  <Press
                    key={item.img}
                    onPress={() => goTo(i)}
                    hitSlop={8}
                    accessibilityLabel={`Slide ${i + 1}`}
                  >
                    <View style={[styles.dot, i === index && styles.dotOn]} />
                  </Press>
                ))}
              </View>

              <Button
                label={last ? "Get started" : "Continue"}
                height={54}
                onPress={next}
                style={styles.cta}
              />
            </View>
          </View>
        </View>
      </GestureDetector>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0B0908" },
  contentWrap: { ...StyleSheet.absoluteFill, alignItems: "center" },
  content: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B2C",
  },
  bottom: { gap: 18 },
  dots: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  dotOn: { width: 22, backgroundColor: "#FFFFFF" },
  cta: { alignSelf: "stretch" },
});
