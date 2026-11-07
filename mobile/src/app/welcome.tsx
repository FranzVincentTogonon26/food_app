import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
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

type Stage = "intro" | "words" | "done";

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

/** How much larger the logo is at the centre of the screen. */
const LOGO_START_SCALE = 1.45;
/** How long the big logo sits in the middle before travelling up. */
const LOGO_HOLD = 1000;
const LOGO_MOVE_MS = 900;
/** The square card shows up while the logo is already moving. */
const MASK_EXPAND_DELAY = 1250;
const MASK_EXPAND_MS = 1000;
/** First word starts once the square has become the full backdrop. */
const CONTENT_AT = MASK_EXPAND_DELAY + MASK_EXPAND_MS + 120;
const WORDS_STOP_AT = CONTENT_AT + 2400;

const scrimColors = [
  "rgba(10, 8, 7, 0.72)",
  "rgba(10, 8, 7, 0.15)",
  "rgba(10, 8, 7, 0.8)",
  "#0C0A09",
] as const;
const scrimLocations = [0, 0.32, 0.65, 1] as const;

function BackdropScrim() {
  return (
    <LinearGradient
      colors={scrimColors}
      locations={scrimLocations}
      style={StyleSheet.absoluteFill}
    />
  );
}

function SlideBackdrop({ uri, active }: { uri: string; active: boolean }) {
  const fade = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    fade.set(
      withTiming(active ? 1 : 0, {
        duration: 650,
        easing: ease.out,
      }),
    );
  }, [active, fade]);

  const style = useAnimatedStyle(() => ({ opacity: fade.get() }));

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
      <BackdropScrim />
    </Animated.View>
  );
}

function splitWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * A single word that lifts into place. Only active during the first reveal
 * after the logo has settled into the header.
 */
function Reveal({
  children,
  delay,
  active,
  offset = 16,
  style,
}: {
  children: ReactNode;
  delay: number;
  active: boolean;
  offset?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const op = useSharedValue(active && !reduced ? 0 : 1);
  const ty = useSharedValue(active && !reduced ? offset : 0);

  useEffect(() => {
    if (reduced || !active) {
      op.set(1);
      ty.set(0);
      return;
    }

    op.set(0);
    ty.set(offset);
    op.set(
      withDelay(delay, withTiming(1, { duration: 560, easing: ease.out })),
    );
    ty.set(
      withDelay(delay, withTiming(0, { duration: 680, easing: ease.out })),
    );
  }, [active, delay, offset, op, reduced, ty]);

  const animated = useAnimatedStyle(() => ({
    opacity: op.get(),
    transform: [{ translateY: ty.get() }],
  }));

  return (
    <Animated.View style={[style, animated]}>{children}</Animated.View>
  );
}

function SlideCopy({
  slide,
  animate,
}: {
  slide: Slide;
  animate: boolean;
}) {
  const line1 = splitWords(slide.t1);
  const line2 = splitWords(slide.t2);
  const sub = splitWords(slide.sub);

  const titleStart = 90;
  const titleStep = 70;
  const titleCount = line1.length + line2.length;
  const subStart = titleStart + titleCount * titleStep + 220;
  const subStep = 20;

  return (
    <>
      <Reveal active={animate} delay={0} offset={10}>
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
            ls={0.18}
            upper
            numberOfLines={1}
            c="rgba(255, 255, 255, 0.76)"
            style={{ marginLeft: 8, flexShrink: 1 }}
          >
            {slide.tag}
          </T>
        </View>
      </Reveal>

      <View
        accessible
        accessibilityLabel={slide.t1}
        style={[styles.wordRow, { marginTop: 14 }]}
      >
        {line1.map((word, i) => (
          <Reveal
            key={`${word}-${i}`}
            active={animate}
            delay={titleStart + i * titleStep}
            offset={22}
          >
            <T f="display" w={800} s={44} lh={1.04} ls={-0.035} c="#FFFFFF">
              {word}
            </T>
          </Reveal>
        ))}
      </View>

      <View
        accessible
        accessibilityLabel={slide.t2}
        style={[styles.wordRow, { marginTop: 2 }]}
      >
        {line2.map((word, i) => (
          <Reveal
            key={`${word}-${i}`}
            active={animate}
            delay={titleStart + (line1.length + i) * titleStep}
            offset={22}
          >
            <T f="display" w={800} s={44} lh={1.04} ls={-0.035} c="#FF6525">
              {word}
            </T>
          </Reveal>
        ))}
      </View>

      <View
        accessible
        accessibilityLabel={slide.sub}
        style={[styles.subRow, { marginTop: 14 }]}
      >
        {sub.map((word, i) => (
          <Reveal
            key={`${word}-${i}`}
            active={animate}
            delay={subStart + i * subStep}
            offset={10}
          >
            <T s={15} lh={1.48} c="rgba(255, 255, 255, 0.68)">
              {word}
            </T>
          </Reveal>
        ))}
      </View>
    </>
  );
}

export default function Welcome() {
  const { width, height } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const finishOnboarding = useApp((s) => s.finishOnboarding);

  const [index, setIndex] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [stage, setStage] = useState<Stage>(reduced ? "done" : "intro");
  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;
  const contentReady = stage !== "intro";
  const animateWords = stage === "words" && index === 0;

  // Final header position (same placement as before).
  const topY = Math.max(insets.top + 8, 52);
  const bottomY = Math.max(insets.bottom + 14, 24);

  // The big logo is centred on the screen before it travels up.
  const initialHeaderTop =
    height * 0.495 - (headerHeight * LOGO_START_SCALE) / 2;

  // Opening phase values.
  const headerOpacity = useSharedValue(reduced ? 1 : 0);
  const headerMove = useSharedValue(reduced ? 1 : 0);
  const glowOpacity = useSharedValue(reduced ? 0 : 0);
  const glowScale = useSharedValue(reduced ? 1 : 0.86);
  const maskOpacity = useSharedValue(reduced ? 1 : 0);
  const maskExpand = useSharedValue(reduced ? 1 : 0);
  const skipOpacity = useSharedValue(reduced ? 1 : 0);
  const bottomOpacity = useSharedValue(reduced ? 1 : 0);

  // Backdrop square: it begins as a card at the centre of the screen and
  // grows into a square large enough to cover the whole viewport.
  const maskStartSide = Math.min(width, height) * 0.6;
  const maskEndSide = Math.max(width, height);

  const maskStyle = useAnimatedStyle(() => {
    const p = maskExpand.get();
    const side = maskStartSide + (maskEndSide - maskStartSide) * p;
    return {
      width: side,
      height: side,
      left: (width - side) / 2,
      top: (height - side) / 2,
      borderRadius: 28 * (1 - p),
      opacity: maskOpacity.get(),
    };
  }, [maskEndSide, maskStartSide, height, width]);

  // The photograph fills the square and settles from a subtle zoom while the
  // mask opens, so the card already feels like a small version of the page.
  const maskInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1.06 - 0.06 * maskExpand.get() }],
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: 1 - maskExpand.get() * maskExpand.get(),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.get(),
    transform: [{ scale: glowScale.get() }],
  }));

  const headerStyle = useAnimatedStyle(() => {
    const p = headerMove.get();
    const scale = LOGO_START_SCALE + (1 - LOGO_START_SCALE) * p;
    const y = initialHeaderTop + (topY - initialHeaderTop) * p;
    return {
      opacity: headerOpacity.get(),
      transform: [{ translateY: y }, { scale }],
    };
  }, [initialHeaderTop, topY]);

  const skipStyle = useAnimatedStyle(() => ({
    opacity: skipOpacity.get(),
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.get(),
  }));

  // Opening choreography: logo appears big in the centre, holds, then shrinks
  // and slides into the header while the square image mask opens.
  useEffect(() => {
    if (reduced) {
      headerOpacity.set(1);
      headerMove.set(1);
      maskOpacity.set(1);
      maskExpand.set(1);
      const done = setTimeout(() => setStage("done"), 0);
      return () => clearTimeout(done);
    }

    if (headerHeight <= 0 || started.current) return;
    started.current = true;

    headerOpacity.set(
      withTiming(1, {
        duration: 560,
        easing: ease.out,
      }),
    );
    glowScale.set(
      withTiming(1, {
        duration: 1000,
        easing: ease.out,
      }),
    );
    glowOpacity.set(
      withSequence(
        withTiming(1, { duration: 700, easing: ease.out }),
        withDelay(
          LOGO_HOLD - 700,
          withTiming(0, { duration: 520, easing: ease.out }),
        ),
      ),
    );

    headerMove.set(
      withDelay(
        LOGO_HOLD,
        withTiming(1, { duration: LOGO_MOVE_MS, easing: ease.inOut }),
      ),
    );

    maskOpacity.set(
      withDelay(
        LOGO_HOLD,
        withTiming(1, { duration: 260, easing: ease.out }),
      ),
    );
    maskExpand.set(
      withDelay(
        MASK_EXPAND_DELAY,
        withTiming(1, {
          duration: MASK_EXPAND_MS,
          easing: ease.inOut,
        }),
      ),
    );

    const reveal = setTimeout(() => setStage("words"), CONTENT_AT);
    const stopWords = setTimeout(() => setStage("done"), WORDS_STOP_AT);

    return () => {
      clearTimeout(reveal);
      clearTimeout(stopWords);
    };
  }, [
    glowOpacity,
    glowScale,
    headerHeight,
    headerMove,
    headerOpacity,
    maskExpand,
    maskOpacity,
    reduced,
  ]);

  // Controls appear once the backdrop is full screen.
  useEffect(() => {
    if (!contentReady) return;

    if (reduced) {
      skipOpacity.set(1);
      bottomOpacity.set(1);
      return;
    }

    skipOpacity.set(
      withDelay(140, withTiming(1, { duration: 420, easing: ease.out })),
    );
    bottomOpacity.set(
      withDelay(520, withTiming(1, { duration: 500, easing: ease.out })),
    );
  }, [bottomOpacity, contentReady, reduced, skipOpacity]);

  // Auto-advance only after the opening, and only until the last slide.
  useEffect(() => {
    if (!contentReady || reduced || index >= SLIDES.length - 1) return;
    timer.current = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
    }, 7000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [contentReady, index, reduced]);

  const goTo = (nextIdx: number) => {
    if (stage === "words") setStage("done");
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, nextIdx)));
  };

  // Functional update so fast/repeated swipes never use a stale index.
  const step = (delta: number) => {
    if (stage === "words") setStage("done");
    setIndex((i) => Math.max(0, Math.min(SLIDES.length - 1, i + delta)));
  };

  const finish = () => {
    finishOnboarding();
    router.replace("/login");
  };

  const next = () => {
    if (last) finish();
    else step(1);
  };

  const swipe = Gesture.Pan()
    .enabled(contentReady)
    .activeOffsetX([-12, 12])
    .onEnd((e) => {
      const flick = Math.abs(e.velocityX) > 450;
      const dragged = Math.abs(e.translationX) > 40;
      if (!flick && !dragged) return;

      // Swipe left -> next slide, swipe right -> previous slide
      const delta = flick
        ? e.velocityX < 0
          ? 1
          : -1
        : e.translationX < 0
          ? 1
          : -1;
      scheduleOnRN(step, delta);
    });

  const pageEntering =
    reduced || animateWords
      ? undefined
      : FadeIn.duration(650).easing(ease.out);

  return (
    <View style={styles.screen}>
      {/* 1. Square image mask / final full-screen backdrop. */}
      <Animated.View
        style={[styles.mask, maskStyle]}
        pointerEvents="none"
      >
        <Animated.View style={[styles.maskInner, maskInnerStyle]}>
          {SLIDES.map((item, i) => (
            <SlideBackdrop
              key={item.img}
              uri={item.img}
              active={i === index}
            />
          ))}

          {/* Soft-focus copy that clears up as the square opens. */}
          <Animated.View
            style={[StyleSheet.absoluteFill, blurStyle]}
            pointerEvents="none"
          >
            <Image
              source={{ uri: SLIDES[0].img }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              blurRadius={18}
              transition={0}
            />
            <BackdropScrim />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* 2. Warm centre glow around the big logo. */}
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

      {/* 3. Logo: big in the centre, then shrinks and slides into the header. */}
      <Animated.View
        style={[
          styles.headerContainer,
          { transformOrigin: "center top" },
          headerStyle,
        ]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        pointerEvents="none"
      >
        <View style={styles.brandBadge}>
          <Icon name="local_fire_department" size={26} color="#0F0C0A" fill />
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
        <T
          w={700}
          s={9.5}
          ls={0.24}
          upper
          c="rgba(255, 178, 122, 0.88)"
          style={{ marginTop: 4 }}
        >
          KITCHEN • SOHO
        </T>
      </Animated.View>

      {/* 4. Top right Skip button. */}
      <Animated.View
        style={[styles.skipContainer, { top: topY + 6 }, skipStyle]}
        pointerEvents={contentReady ? "box-none" : "none"}
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

      {/* 5. Swipeable slide copy and bottom controls. */}
      <GestureDetector gesture={swipe}>
        <View style={styles.contentWrap}>
          <View
            style={[
              styles.labelsContainer,
              {
                maxWidth: Math.min(520, width - 40),
              },
            ]}
          >
            {contentReady && (
              <Animated.View
                key={slide.img}
                style={[styles.textPage, { paddingBottom: bottomY + 104 }]}
                pointerEvents="none"
                entering={pageEntering}
                exiting={
                  reduced ? undefined : FadeOut.duration(650).easing(ease.out)
                }
              >
                <SlideCopy slide={slide} animate={animateWords} />
              </Animated.View>
            )}
          </View>

          <Animated.View
            style={[
              styles.bottomSection,
              {
                bottom: bottomY,
                maxWidth: Math.min(520, width - 40),
              },
              bottomStyle,
            ]}
            pointerEvents={contentReady ? "box-none" : "none"}
          >
            <View style={styles.actionRow}>
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
  mask: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: "#0C0A09",
  },
  maskInner: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  brandBadge: {
    width: 54,
    height: 54,
    borderRadius: 17,
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
    justifyContent: "flex-end",
  },
  textPage: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
  },
  wordRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 11,
    rowGap: 2,
  },
  subRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 4.2,
    maxWidth: 330,
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
