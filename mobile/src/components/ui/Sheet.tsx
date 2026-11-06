import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ToastHost } from "@/components/feedback/Toast";
import { alpha, ease } from "@/theme/tokens";
import { ThemeProvider, useTheme } from "@/theme/theme";

import { Glass } from "./Glass";
import { formDismissMode } from "./KeyboardInst";

const isIOS = process.env.EXPO_OS === "ios";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: "glass" | "solid";
  /** sticky footer under a scrollable body (solid sheets) */
  footer?: ReactNode;
  /** sticky header above the scroll body */
  header?: ReactNode;
  scroll?: boolean;
};

/**
 * Bottom sheet: the scrim fades in over 360ms, the panel rises with
 * cubic-bezier(.32,.72,0,1) over 540ms, 32px top radius and a grab handle. Drag
 * the handle/panel down to dismiss. With the keyboard up the panel rides above
 * it and its scroll body shrinks (never past the status bar), on both platforms.
 */
export function Sheet(props: Props) {
  const [mounted, setMounted] = useState(props.visible);
  if (props.visible && !mounted) setMounted(true);
  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={props.onClose}
    >
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SheetBody {...props} onHidden={() => setMounted(false)} />
          <ToastHost />
        </GestureHandlerRootView>
      </ThemeProvider>
    </Modal>
  );
}

function SheetBody({
  visible,
  onClose,
  children,
  variant = "solid",
  footer,
  header,
  scroll = variant === "solid",
  onHidden,
}: Props & { onHidden: () => void }) {
  const { c } = useTheme();
  const { height } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();

  const y = useSharedValue(height);
  const scrim = useSharedValue(0);
  const scrollRef = useRef<any>(null);
  const innerRef = useRef<any>(null);
  const viewport = useRef({ top: 0, h: 0 });

  const [kbUp, setKbUp] = useState(false);

  useEffect(() => {
    // Once the panel has shrunk above the keyboard, scroll the focused field
    // back into view (Android does this natively; iOS leaves it wherever it was
    // before the shrink).
    const reveal = () => {
      const input = TextInput.State.currentlyFocusedInput();
      const inner = innerRef.current;
      if (!input || !inner) return;
      input.measureLayout(
        inner,
        (_x, fy, _w, fh) => {
          const { top, h } = viewport.current;
          if (fy + fh + 16 > top + h)
            scrollRef.current?.scrollTo({
              y: fy + fh + 16 - h,
              animated: true,
            });
          else if (fy - 16 < top)
            scrollRef.current?.scrollTo({
              y: Math.max(0, fy - 16),
              animated: true,
            });
        },
        () => {},
      );
    };

    const subs = [
      Keyboard.addListener(
        isIOS ? "keyboardWillShow" : "keyboardDidShow",
        () => setKbUp(true),
      ),
      Keyboard.addListener(
        isIOS ? "keyboardWillHide" : "keyboardDidHide",
        () => setKbUp(false),
      ),
      Keyboard.addListener("keyboardDidShow", () => setTimeout(reveal, 60)),
    ];

    return () => subs.forEach((s) => s.remove());
  }, []);

  useEffect(() => {
    if (visible) {
      y.set(withTiming(0, { duration: 540, easing: ease.sheet }));
      scrim.set(withTiming(1, { duration: 360, easing: ease.out }));
    } else {
      scrim.set(withTiming(0, { duration: 360, easing: ease.out }));
      y.set(
        withTiming(height, { duration: 420, easing: ease.sheet }, (done) => {
          if (done) scheduleOnRN(onHidden);
        }),
      );
    }
  }, [visible, height, y, scrim, onHidden]);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-20, 20])
    .onChange((e) => {
      y.set(Math.max(0, y.value + e.changeY));
    })
    .onEnd((e) => {
      if (y.value > 120 || e.velocityY > 900) scheduleOnRN(onClose);
      else y.set(withTiming(0, { duration: 320, easing: ease.sheet }));
    });

  const panel = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  const bottomPad = kbUp
    ? 10
    : Math.max(insets.bottom, 14) + (variant === "glass" ? 0 : 6);

  const handle = (
    <View
      style={{
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: variant === "glass" ? 4 : 6,
      }}
    >
      <View
        style={{
          width: 40,
          height: 5,
          borderRadius: 3,
          backgroundColor: c.lineStrong,
        }}
      />
    </View>
  );

  const content =
    variant === "glass" ? (
      <GestureDetector gesture={pan}>
        <Glass
          variant="strong"
          style={[
            styles.panel,
            {
              paddingHorizontal: 20,
              paddingBottom: bottomPad,
              borderTopWidth: 1,
              borderTopColor: c.glassLine,
            },
          ]}
        >
          {handle}
          <View style={{ gap: 14, marginTop: 14 }}>{children}</View>
        </Glass>
      </GestureDetector>
    ) : (
      <View
        style={[
          styles.panel,
          {
            backgroundColor: c.bg,
            maxHeight: height * 0.9,
            flexShrink: 1,
          },
        ]}
      >
        <GestureDetector gesture={pan}>
          <View>
            {handle}
            {header}
          </View>
        </GestureDetector>
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            innerViewRef={innerRef}
            onLayout={(e) => (viewport.current.h = e.nativeEvent.layout.height)}
            onScroll={(e) =>
              (viewport.current.top = e.nativeEvent.contentOffset.y)
            }
            scrollEventThrottle={32}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={formDismissMode}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: footer ? 16 : bottomPad,
              gap: 14,
            }}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
        {footer ? (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: bottomPad,
              borderTopWidth: 1,
              borderTopColor: c.line,
            }}
          >
            {footer}
          </View>
        ) : null}
      </View>
    );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: c.scrim },
          scrimStyle,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close sheet"
        />
      </Animated.View>
      <KeyboardAvoidingView
        behavior="padding"
        style={[styles.anchor, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.lift,
            { boxShadow: `0px -24px 60px ${alpha(c.shadow, 0.25)}` },
            panel,
          ]}
        >
          {content}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { flex: 1, justifyContent: "flex-end" },
  lift: { flexShrink: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  panel: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
});
