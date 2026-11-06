import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AuthCta, AuthScreen, TextLink } from "@/components/auth/AuthScreen";
import { Field } from "@/components/ui/Fields";
import { Icon } from "@/components/ui/Icon";
import { haptic } from "@/components/ui/Press";
import { T } from "@/components/ui/Text";
import { sendPasswordReset } from "@/lib/accounts";
import { emailValid, useAuthForm, useAuthNav } from "@/lib/auth";
import { AUTH_IMG } from "@/store/constants";
import { toast } from "@/store/feedback";
import { useTheme } from "@/theme/theme";

/**
 * Account recovery - Firebase emails a password-reset link, then it's back to
 * sign in.
 */
export default function ForgotScreen() {
  const { c } = useTheme();
  const email = useAuthForm((s) => s.email);
  const { toLogin } = useAuthNav();
  const [busy, setBusy] = useState(false);

  const sendLink = async () => {
    if (busy) return;
    if (!email.trim() || !emailValid(email)) {
      toast("Check your email", "Enter the email on your account", {
        icon: "info",
      });
      return;
    }

    setBusy(true);
    const res = await sendPasswordReset(email);
    setBusy(false);

    if (!res.ok) {
      haptic("medium");
      toast("Couldn't send the link", res.message, { icon: "error" });
      return;
    }

    haptic("success");
    toast(
      "Check your inbox",
      `If ${email.trim()} has an account, a reset link is on its way`,
      { icon: "mail" },
    );
    toLogin();
  };

  return (
    <AuthScreen
      img={AUTH_IMG.forgot}
      height={270}
      eyebrow="Account recovery"
      title="Reset your password"
      onBack={toLogin}
    >
      <T s={14.5} lh={1.5} c="text2">
        Enter the email on your account and well send you a link to choose a new
        password.
      </T>
      <Field
        icon="mail"
        value={email}
        onChangeText={(v) => useAuthForm.getState().set({ email: v })}
        error={email.length > 0 && !emailValid(email)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={sendLink}
      />
      <AuthCta
        label="Send reset link"
        busyLabel="Sending..."
        busy={busy}
        onPress={sendLink}
      />
      <View
        style={[
          styles.info,
          { backgroundColor: c.surface1, borderColor: c.line },
        ]}
      >
        <Icon name="info" size={20} color="accent" />
        <T s={13} lh={1.5} c="text2" style={{ flex: 1 }}>
          The link expires after an hour. Signed up with Apple or Google? Use
          that button on the sign-in screen instead.
        </T>
      </View>
      <TextLink onPress={toLogin} style={styles.back}>
        <T w={600} s={13.5} c="text2">
          Back to sign in
        </T>
      </TextLink>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  info: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  back: { alignSelf: "center", marginTop: "auto", paddingTop: 10 },
});
