import { useRef, useState, type ElementRef } from "react";
import { StyleSheet, View, type TextInput } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import {
  AuthCta,
  AuthScreen,
  PwToggle,
  TextLink,
} from "@/components/auth/AuthScreen";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { Check } from "@/components/ui/Controls";
import { Field } from "@/components/ui/Fields";
import { haptic, Press } from "@/components/ui/Press";
import { T } from "@/components/ui/Text";
import { registerWithEmail } from "@/lib/accounts";
import {
  emailValid,
  pwScore,
  useAuthForm,
  useAuthNav,
  useExitAuth,
} from "@/lib/auth";
import { AUTH_IMG } from "@/store/constants";
import { toast } from "@/store/feedback";
import { useTheme } from "@/theme/theme";
import { ease } from "@/theme/tokens";

const STRENGTH = ["", "Weak", "Good", "Strong"];

export default function RegisterScreen() {
  const { name, email, pw, showPw, terms, set } = useAuthForm();
  const { toLogin } = useAuthNav();
  const { finish, finishProvider } = useExitAuth();
  const [busy, setBusy] = useState(false);

  const emailRef = useRef<ElementRef<typeof TextInput>>(null);
  const pwRef = useRef<ElementRef<typeof TextInput>>(null);

  const score = pwScore(pw);
  const ready = terms && pw.length >= 8 && !!name.trim();

  const register = async () => {
    if (busy || !ready) {
      if (!terms)
        toast("One more thing", "Please accept the terms to continue", {
          icon: "info",
        });
      return;
    }
    if (!emailValid(email) || !email.trim()) {
      toast("Check your email", "That email address doesn't look right", {
        icon: "info",
      });
      return;
    }

    setBusy(true);
    const res = await registerWithEmail(name, email, pw);
    if (!res.ok) {
      setBusy(false);
      haptic("medium");
      toast("Couldn't create your account", res.message, { icon: "error" });
      return;
    }

    finish(res.user, "Account created", "We sent a link to verify your email");
  };

  return (
    <AuthScreen
      img={AUTH_IMG.register}
      height={270}
      eyebrow="Join Ember"
      title="Create your account"
      onBack={toLogin}
    >
      <Field
        icon="person"
        value={name}
        onChangeText={(v) => set({ name: v })}
        placeholder="Full name"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <Field
        ref={emailRef}
        icon="mail"
        value={email}
        onChangeText={(v) => set({ email: v })}
        error={email.length > 0 && !emailValid(email)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => pwRef.current?.focus()}
      />
      <Field
        ref={pwRef}
        icon="lock"
        value={pw}
        onChangeText={(v) => set({ pw: v })}
        placeholder="Password (8+ characters)"
        secureTextEntry={!showPw}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        right={<PwToggle />}
      />
      <View style={styles.strength}>
        <View style={styles.bars}>
          {[1, 2, 3].map((k) => (
            <StrengthBar key={k} on={score >= k} score={score} />
          ))}
        </View>
        <T w={600} s={11.5} c="text3" style={styles.strengthLabel}>
          {STRENGTH[score]}
        </T>
      </View>
      <Press
        onPress={() => set({ terms: !terms })}
        scaleTo={0.98}
        haptic="selection"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: terms }}
        style={styles.terms}
      >
        <Check on={terms} size={22} radius={7} />
        <T s={13} lh={1.4} c="text2" style={{ flex: 1 }}>
          I agree to the Terms and Privacy Policy
        </T>
      </Press>
      <AuthCta
        label="Create account"
        busyLabel="Creating..."
        busy={busy}
        dim={!ready}
        onPress={register}
      />
      <SocialAuth mode="signUp" onSignedIn={finishProvider} />
      <T s={11.5} lh={1.45} c="text3" center>
        By continuing with Apple or Google you agree to the Terms and Privacy
        Policy.
      </T>
      <TextLink onPress={toLogin} style={styles.signIn}>
        <T w={500} s={13.5} c="text2">
          Already a member?{" "}
          <T w={700} s={13.5} c="accentText">
            Sign in
          </T>
        </T>
      </TextLink>
    </AuthScreen>
  );
}

/** One 4px bar of the meter - err / warn / ok by score, cross-fading over 300ms. */
function StrengthBar({ on, score }: { on: boolean; score: number }) {
  const { c } = useTheme();
  const color = on ? [c.surface2, c.err, c.warn, c.ok][score] : c.surface2;

  const a = useAnimatedStyle(() => ({
    backgroundColor: withTiming(color, { duration: 300, easing: ease.out }),
  }));

  return <Animated.View style={[styles.bar, a]} />;
}

const styles = StyleSheet.create({
  strength: { flexDirection: "row", alignItems: "center", gap: 10 },
  bars: { flex: 1, flexDirection: "row", gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { minWidth: 46, textAlign: "right" },
  terms: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  signIn: { alignSelf: "center", marginTop: "auto", paddingTop: 10 },
});
