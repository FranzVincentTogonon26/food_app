import type { ReactNode } from "react";
import { KeyboardAvoidingView } from "react-native";

const isAndroid = process.env.EXPO_OS === "android";

export function KeyboardInset({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled={isAndroid}
      style={{ flex: 1 }}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

export const formDismissMode = isAndroid ? "on-drag" : "interactive";
