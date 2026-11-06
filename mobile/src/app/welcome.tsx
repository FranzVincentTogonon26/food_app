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
} from "react-native-reanimated";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";

import { ONBOARDING_IMAGES } from "@food_app/shared";

import { Icon } from "@/components/ui/Icon";
import { Press } from "@/components/ui/Press";
import { T } from "@/components/ui/Text";
import { useApp } from "@/store/store";
import { ease } from "@/theme/tokens";

type Slide = {
  step: string;
  tag: string;
  t1: string;
  t2: string;
  sub: string;
  img: string;
};

const SLIDES: readonly Slide[] = [
  {
    step: "01",
    tag: "WOOD-FIRED KITCHEN",
    t1: "Fired hot.",
    t2: "Delivered fast.",
    sub: "Pizzas, smash burgers and fresh pasta from the Ember oven to your door.",
    img: ONBOARDING_IMAGES[0],
  },
  {
    step: "02",
    tag: "MADE TO ORDER",
    t1: "Your way.",
    t2: "Every time.",
    sub: "Pick your size and extras. Every dish is fired the moment you order.",
    img: ONBOARDING_IMAGES[1],
  },
  {
    step: "03",
    tag: "LIVE TRACKING",
    t1: "Oven to",
    t2: "your door.",
    sub: "Follow your order from the kitchen to your doorstep, minute by minute.",
    img: ONBOARDING_IMAGES[2],
  },
];

function SlideBackdrop({
  uri,
  active,
  masterOpacity,
}: {
  uri: string;
  active: boolean;
  masterOpacity: SharedValue<number>;
}) {
  const fade = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    fade.value = withTiming(active ? 1 : 0, {
      duration: 650,
      easing: ease.out,
    });
  }, [active, fade]);

  const style = useAnimatedStyle(() => ({
    opacity: fade.value * masterOpacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    >
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={0}
      />
      <LinearGradient
        colors={[
          "rgba(10, 8, 7, 0.72)",
          "rgba(10, 8, 7, 0.15)",
          "rgba(10, 8, 7, 0.8)",
          "#0C0A09",
        ]}
        locations={[0, 0.32, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export default function Welcome() {
  const { width, height } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const finishOnboarding = useApp((s) => s.finishOnboarding);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  // Header geometry: centered in Phase 1 -> slides to top in Phase 2
  const topY = Math.max(insets.top + 8, 52);
  const bottomY = Math.max(insets.bottom + 14, 24);
  const headerCenterY = height * 0.42 - 50;

  // Phase animations
  const headerOpacity = useSharedValue(reduced ? 1 : 0);
  const headerScale = useSharedValue(reduced ? 1 : 0.88);
  const headerProgress = useSharedValue(reduced ? 1 : 0); // 0 = center, 1 = top

  const glowOpacity = useSharedValue(reduced ? 0 : 1);
  const bgMasterOpacity = useSharedValue(reduced ? 1 : 0);
  const skipOpacity = useSharedValue(reduced ? 1 : 0);

  // Labels reveal
  const eyebrowReveal = useSharedValue(reduced ? 1 : 0);
  const title1Reveal = useSharedValue(reduced ? 1 : 0);
  const title2Reveal = useSharedValue(reduced ? 1 : 0);
  const subReveal = useSharedValue(reduced ? 1 : 0);
  const bottomOpacity = useSharedValue(reduced ? 1 : 0);

  // Slide content transition on index change
  const slideChangeProgress = useSharedValue(1);

  // Opening choreography (Phases 1-4)
  useEffect(() => {
    if (reduced) return;

    // 1. Appears in center with faded entrance animation (0 - 500ms)
    headerOpacity.value = withTiming(1, { duration: 520, easing: ease.out });
    headerScale.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Slides to top & slowly fades in background animation (850ms - 1600ms)
    headerProgress.value = withDelay(
      850,
      withTiming(1, {
        duration: 750,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      }),
    );
    bgMasterOpacity.value = withDelay(
      850,
      withTiming(1, { duration: 900, easing: ease.out }),
    );
    glowOpacity.value = withDelay(
      800,
      withTiming(0, { duration: 500, easing: ease.out }),
    );

    // 3. Slowly reveals the labels according to the design (1550ms - 2050ms)
    skipOpacity.value = withDelay(
      1500,
      withTiming(1, { duration: 420, easing: ease.out }),
    );
    eyebrowReveal.value = withDelay(
      1550,
      withTiming(1, { duration: 450, easing: ease.out }),
    );
    title1Reveal.value = withDelay(
      1680,
      withTiming(1, { duration: 480, easing: ease.out }),
    );
    title2Reveal.value = withDelay(
      1800,
      withTiming(1, { duration: 480, easing: ease.out }),
    );
    subReveal.value = withDelay(
      1920,
      withTiming(1, { duration: 500, easing: ease.out }),
    );

    // 4. Displays full design screen with bottom controls (2100ms)
    bottomOpacity.value = withDelay(
      2100,
      withTiming(1, { duration: 500, easing: ease.out }),
    );
  }, [
    bgMasterOpacity,
    bottomOpacity,
    eyebrowReveal,
    glowOpacity,
    headerOpacity,
    headerProgress,
    headerScale,
    reduced,
    skipOpacity,
    subReveal,
    title1Reveal,
    title2Reveal,
  ]);

  // Handle slide transitions on index switch
  useEffect(() => {
    if (reduced) return;
    slideChangeProgress.value = 0;
    slideChangeProgress.value = withTiming(1, {
      duration: 480,
      easing: ease.out,
    });
  }, [index, reduced, slideChangeProgress]);

  // Auto-advance timer
  useEffect(() => {
    if (paused || reduced || index >= SLIDES.length - 1) return;
    timer.current = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
    }, 7000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, reduced]);

  const goTo = (nextIdx: number) => {
    setPaused(true);
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, nextIdx)));
  };

  const finish = () => {
    setPaused(true);
    finishOnboarding();
    router.replace("/login");
  };

  const next = () => {
    if (last) finish();
    else goTo(index + 1);
  };

  const swipe = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .onEnd((e) => {
      if (e.translationX <= -44) scheduleOnRN(goTo, index + 1);
      else if (e.translationX >= 44) scheduleOnRN(goTo, index - 1);
    });

  // Animated styles
  const headerStyle = useAnimatedStyle(() => {
    const currentY =
      headerCenterY + headerProgress.value * (topY - headerCenterY);
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: currentY }, { scale: headerScale.value }],
    };
  });

  const sohoStyle = useAnimatedStyle(() => ({
    opacity: headerProgress.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: (1 - headerProgress.value) * glowOpacity.value,
  }));

  const skipStyle = useAnimatedStyle(() => ({
    opacity: skipOpacity.value,
  }));

  const eyebrowStyle = useAnimatedStyle(() => ({
    opacity: eyebrowReveal.value * slideChangeProgress.value,
    transform: [{ translateY: (1 - eyebrowReveal.value) * 14 }],
  }));

  const title1Style = useAnimatedStyle(() => ({
    opacity: title1Reveal.value * slideChangeProgress.value,
    transform: [{ translateY: (1 - title1Reveal.value) * 16 }],
  }));

  const title2Style = useAnimatedStyle(() => ({
    opacity: title2Reveal.value * slideChangeProgress.value,
    transform: [{ translateY: (1 - title2Reveal.value) * 16 }],
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subReveal.value * slideChangeProgress.value,
    transform: [{ translateY: (1 - subReveal.value) * 14 }],
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
  }));

  return (
    <View style={styles.screen}>
      {/* 1. Background Food Images (faded in during Phase 2) */}
      {SLIDES.map((item, i) => (
        <SlideBackdrop
          key={item.img}
          uri={item.img}
          active={i === index}
          masterOpacity={bgMasterOpacity}
        />
      ))}

      {/* 2. Warm Center Radial Glow for Phase 1 */}
      <Animated.View
        style={[StyleSheet.absoluteFill, glowStyle]}
        pointerEvents="none"
      >
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <RadialGradient id="welcome-center-glow" cx="50%" cy="46%" r="55%">
              <Stop offset="0" stopColor="#FF6B2C" stopOpacity={0.32} />
              <Stop offset="0.55" stopColor="#FF6B2C" stopOpacity={0.08} />
              <Stop offset="1" stopColor="#0C0A09" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#welcome-center-glow)" />
        </Svg>
      </Animated.View>

      {/* 3. Header: Badge + EMBER + KITCHEN SOHO (center -> slides to top) */}
      <Animated.View
        style={[styles.headerContainer, headerStyle]}
        pointerEvents="none"
      >
        <View style={styles.brandBadge}>
          <Icon name="local_fire_department" size={28} color="#0F0C0A" fill />
        </View>
        <T
          f="display"
          w={800}
          s={27}
          ls={0.01}
          c="#FFFFFF"
          style={{ marginTop: 10 }}
        >
          EMBER
        </T>
        <Animated.View style={sohoStyle}>
          <T
            w={700}
            s={9.5}
            ls={2.2}
            upper
            c="rgba(255, 178, 122, 0.88)"
            style={{ marginTop: 4 }}
          >
            KITCHEN • SOHO
          </T>
        </Animated.View>
      </Animated.View>

      {/* 4. Top Right Skip Button */}
      <Animated.View
        style={[styles.skipContainer, { top: topY + 6 }, skipStyle]}
        pointerEvents="box-none"
      >
        <Press
          onPress={finish}
          hitSlop={14}
          style={styles.skipButton}
          accessibilityLabel="Skip"
        >
          <T w={600} s={13} c="rgba(255, 255, 255, 0.9)">
            Skip
          </T>
        </Press>
      </Animated.View>

      {/* 5. Main Swipeable Slide Content & Bottom Controls */}
      <GestureDetector gesture={swipe}>
        <View style={styles.contentWrap}>
          {/* Middle Labels Area */}
          <View
            style={[
              styles.labelsContainer,
              {
                paddingBottom: bottomY + 104,
                maxWidth: Math.min(520, width - 40),
              },
            ]}
          >
            {/* Eyebrow Step Indicator */}
            <Animated.View style={eyebrowStyle}>
              <View style={styles.eyebrowRow}>
                <T w={800} s={13} c="#FF6525">
                  {slide.step}
                </T>
                <T s={13} c="rgba(255, 255, 255, 0.42)">
                  {" / 03  "}
                </T>
                <View style={styles.eyebrowLine} />
                <T
                  w={700}
                  s={11}
                  ls={1.2}
                  upper
                  c="rgba(255, 255, 255, 0.76)"
                  style={{ marginLeft: 8 }}
                >
                  {slide.tag}
                </T>
              </View>
            </Animated.View>

            {/* Title Line 1 (White) */}
            <Animated.View style={title1Style}>
              <T
                f="display"
                w={800}
                s={44}
                lh={1.04}
                ls={-0.035}
                c="#FFFFFF"
                style={{ marginTop: 14 }}
              >
                {slide.t1}
              </T>
            </Animated.View>

            {/* Title Line 2 (Orange) */}
            <Animated.View style={title2Style}>
              <T
                f="display"
                w={800}
                s={44}
                lh={1.04}
                ls={-0.035}
                c="#FF6525"
                style={{ marginTop: 2 }}
              >
                {slide.t2}
              </T>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View style={subStyle}>
              <T
                s={15}
                lh={1.48}
                c="rgba(255, 255, 255, 0.68)"
                style={{ marginTop: 14, maxWidth: 330 }}
              >
                {slide.sub}
              </T>
            </Animated.View>
          </View>

          {/* Bottom Controls (Indicators + Arrow Button + Sign In) */}
          <Animated.View
            style={[
              styles.bottomSection,
              {
                bottom: bottomY,
                maxWidth: Math.min(520, width - 40),
              },
              bottomStyle,
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.actionRow}>
              {/* Slide Indicators: active dash, inactive dots */}
              <View style={styles.indicators}>
                {SLIDES.map((_, i) => (
                  <Press
                    key={i}
                    onPress={() => goTo(i)}
                    hitSlop={10}
                    accessibilityLabel={`Slide ${i + 1}`}
                  >
                    <View
                      style={[
                        styles.indicatorDot,
                        i === index && styles.indicatorActive,
                      ]}
                    />
                  </Press>
                ))}
              </View>

              {/* Circular Action Button */}
              <Press
                onPress={next}
                scaleTo={0.92}
                hitSlop={10}
                accessibilityLabel={last ? "Get started" : "Next slide"}
              >
                <View style={styles.arrowGlow}>
                  <View style={styles.arrowCircle}>
                    <Icon name="arrow_forward" size={24} color="#FF6525" />
                  </View>
                </View>
              </Press>
            </View>

            {/* Footer Sign In Link */}
            <Press onPress={finish} hitSlop={12} style={styles.signInLink}>
              <T s={13.5} c="rgba(255, 255, 255, 0.65)">
                Already have an account?{" "}
                <T
                  s={13.5}
                  w={700}
                  c="#FFFFFF"
                  style={{ textDecorationLine: "underline" }}
                >
                  Sign in
                </T>
              </T>
            </Press>
          </Animated.View>
        </View>
      </GestureDetector>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0C0A09",
  },
  headerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  brandBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FF6525",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6525",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  skipContainer: {
    position: "absolute",
    right: 20,
    zIndex: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  contentWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
  },
  labelsContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    justifyContent: "flex-end",
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyebrowLine: {
    width: 22,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  bottomSection: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: 24,
    gap: 22,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  indicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  indicatorActive: {
    width: 28,
    backgroundColor: "#FF6525",
  },
  arrowGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 101, 37, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#181310",
    borderWidth: 2.5,
    borderColor: "#FF6525",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6525",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  signInLink: {
    alignSelf: "center",
    paddingVertical: 6,
  },
});
