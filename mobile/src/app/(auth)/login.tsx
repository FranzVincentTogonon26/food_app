import { useRef, useState } from "react";
import { StyleSheet, View, type TextInput } from "react-native";

import {
  AuthCta,
  AuthScreen,
  PwToggle,
  TextLink,
} from "@/components/auth/AuthScreen";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { Field } from "@/components/ui/Fields";
import { haptic } from "@/components/ui/Press";
import { T } from "@/components/ui/Text";
import { signInWithEmail } from "@/lib/accounts";
import { emailValid, useAuthForm, useAuthNav, useExitAuth } from "@/lib/auth";
import { AUTH_IMG } from "@/store/constants";
import { toast } from "@/store/feedback";

/**
 * Sign in - photo header with the Ember wordmark. Opened from the cart
 * ('?next=/checkout') it switches to the "Almost there" copy and the guest link
 * returns to the cart; other gates keep the default copy.
 */
export default function LoginScreen() {
  const { email, pw, showPw, set } = useAuthForm();
  const { go } = useAuthNav();
  const { finish, finishProvider, guest, next } = useExitAuth();
  const [busy, setBusy] = useState(false);

  const pwRef = useRef<TextInput>(null);
  const pending = next === "/checkout";

  const login = async () => {
    if (busy) return;
    if (!email.trim() || !pw) {
      toast("Sign in", "Enter your email and password", { icon: "info" });
      return;
    }

    setBusy(true);
    const res = await signInWithEmail(email, pw);
    if (!res.ok) {
      setBusy(false);
      haptic("medium");
      toast("Couldn't sign in", res.message, { icon: "error" });
      return;
    }

    finish(res.user, "Welcome back", (name) => "Signed in as " + name);
  };

  return (
    <AuthScreen
      img={AUTH_IMG.login}
      height={300}
      brand
      eyebrow={pending ? "Almost there" : "Welcome back"}
      title={pending ? "Sign in to place your order" : "Sign in to Ember"}
    >
      <T s={14.5} lh={1.5} c="text2">
        {pending
          ? "Your cart is saved. Sign in or create an account to check out."
          : "Track live orders, save favourites and check out in one tap."}
      </T>
      <Field
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
        placeholder="Password"
        secureTextEntry={!showPw}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={login}
        right={<PwToggle />}
      />
      <TextLink onPress={() => go("/forgot")} style={styles.forgot}>
        <T w={600} s={13} c="accentText">
          Forgot password?
        </T>
      </TextLink>
      <AuthCta
        label="Sign in"
        busyLabel="Signing in..."
        busy={busy}
        onPress={login}
      />
      <SocialAuth mode="signIn" onSignedIn={finishProvider} />
      <View style={styles.footer}>
        <TextLink onPress={() => go("/register")} style={styles.footLink}>
          <T w={500} s={13.5} c="text2">
            New here?{" "}
            <T w={700} s={13.5} c="accentText">
              Create account
            </T>
          </T>
        </TextLink>
        <TextLink onPress={guest} style={styles.footLink}>
          <T w={600} s={13.5} c="text2">
            {pending ? "Back to cart" : "Browse as guest"}
          </T>
        </TextLink>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: "flex-end", paddingVertical: 2 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 10,
  },
  footLink: { paddingVertical: 8 },
});
