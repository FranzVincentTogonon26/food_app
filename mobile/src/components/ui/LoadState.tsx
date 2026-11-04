import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button } from "@/components/ui/Controls";
import { Icon } from "@/components/ui/Icon";
import { T } from "@/components/ui/Text";
import { useTheme } from "@/theme/theme";

/**
 * Full-screen placeholder while something loads from the server, when it
 * couldn't, or when there's nothing to show - with an optional action
 * (Retry, Sign in...).
 */
export function LoadState({
  icon = "error",
  title,
  sub,
  loading,
  action,
  onAction,
  busy,
  children,
}: {
  icon?: string;
  title: string;
  sub?: string;
  loading?: boolean;
  action?: string;
  onAction?: () => void;
  /** the action is running */
  busy?: boolean;
  children?: ReactNode;
}) {
  const { c } = useTheme();

  return (
    <View
      style={[styles.screen, { backgroundColor: c.bg }]}
      accessibilityLiveRegion="polite"
    >
      <Animated.View entering={FadeIn.duration(260)} style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color={c.accent} />
        ) : (
          <View
            style={[
              styles.icon,
              { backgroundColor: c.surface1, borderColor: c.line },
            ]}
          >
            <Icon name={icon} size={30} color="text2" />
          </View>
        )}
        <T f="display" w={800} s={22} ls={-0.01} center>
          {title}
        </T>
        {sub ? (
          <T s={14.5} lh={1.5} c="text2" center style={{ maxWidth: 300 }}>
            {sub}
          </T>
        ) : null}
        {action && onAction ? (
          <Button
            label={action}
            onPress={onAction}
            loading={busy}
            height={50}
            variant="ink"
            style={{ alignSelf: "stretch", marginTop: 8 }}
          />
        ) : null}
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  body: {
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 340,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});
