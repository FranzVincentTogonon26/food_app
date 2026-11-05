import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Controls";
import { T } from "@/components/ui/Text";
import { signInWithProvider } from "@/lib/accounts";
import type { User } from "@/store/types";
import { useTheme } from "@/theme/theme";

type Provider = "apple" | "google";

type Props = {
  /** Login → "Sign in with ...", Register → "Sign up with ..." */
  mode: "signIn" | "signUp";
  /** called once the user is signed in */
  onSignedIn: (user: User) => void;
};

export function SocialAuth({ mode, onSignedIn }: Props) {
  const { c } = useTheme();
  const [busy, setBusy] = useState<Provider | null>(null);
  const verb = mode === "signIn" ? "Sign in" : "Sign up";

  const run = async (provider: Provider) => {
    if (busy) return;
    setBusy(provider);
    const res = await signInWithProvider(provider);
    setBusy(null);
    if (res.ok) onSignedIn(res.user);
  };

  return (
    <>
      <View style={styles.divider}>
        <View style={[styles.rule, { backgroundColor: c.lineStrong }]} />
        <T w={600} s={11} ls={0.08} upper c="text3">
          {mode === "signIn" ? "or continue with" : "or sign up with"}
        </T>
        <View style={[styles.rule, { backgroundColor: c.lineStrong }]} />
      </View>
      <View style={styles.stack}>
        <Button
          label={`${verb} with Apple`}
          variant="ink"
          height={50}
          loading={busy === "apple"}
          onPress={() => run("apple")}
        />
        <Button
          label={`${verb} with Google`}
          variant="outline"
          height={50}
          loading={busy === "google"}
          onPress={() => run("google")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  rule: { flex: 1, height: 1 },
  stack: { gap: 10 },
});
