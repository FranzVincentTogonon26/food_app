import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/theme/theme";

import { Switch } from "./Controls";
import { Icon } from "./Icon";
import { Press } from "./Press";
import { T } from "./Text";

/** Card: the first surface colour, a hairline border and 22px corners. */
export function Card({
  children,
  style,
  radius = 22,
  pad,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  pad?: number;
}) {
  const { c } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: c.surface1,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: radius,
          padding: pad,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Card whose rows are separated by hairlines and clipped to the radius. */
export function Group({
  children,
  style,
  radius = 22,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}) {
  const { c } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: c.surface1,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: radius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type RowProps = {
  icon?: string;
  title: string;
  sub?: string;
  onPress?: () => void;
  last?: boolean;
  right?: ReactNode;
  chevron?: boolean;
  minHeight?: number;
  iconTone?: "surface" | "accent";
};

/** Settings / profile list row: 38px icon tile, title + sub, trailing chevron. */
export function ListRow({
  icon,
  title,
  sub,
  onPress,
  last,
  right,
  chevron = true,
  minHeight = 62,
  iconTone = "surface",
}: RowProps) {
  const { c } = useTheme();

  return (
    <Press
      onPress={onPress}
      scaleTo={0.985}
      style={{
        minHeight,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor:
              iconTone === "accent" ? c.accentSoft : c.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name={icon}
            size={21}
            color={iconTone === "accent" ? c.accent : c.text1}
          />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0, gap: 2, paddingVertical: 10 }}>
        <T w={600} s={14.5}>
          {title}
        </T>
        {sub ? (
          <T s={12.5} c="text3" numberOfLines={1}>
            {sub}
          </T>
        ) : null}
      </View>
      {right}
      {chevron ? (
        <Icon name="chevron_right" size={21} color="text3" />
      ) : null}
    </Press>
  );
}

/** Row with a trailing switch - the whole row toggles. */
export function ToggleRow({
  title,
  sub,
  on,
  onToggle,
  last,
  minHeight = 58,
  bold,
}: {
  title: string;
  sub?: string;
  on: boolean;
  onToggle: () => void;
  last?: boolean;
  minHeight?: number;
  bold?: boolean;
}) {
  const { c } = useTheme();

  return (
    <Press
      onPress={onToggle}
      scaleTo={0.985}
      haptic="selection"
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      style={{
        minHeight,
        paddingHorizontal: 16,
        paddingVertical: sub ? 12 : 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <T w={bold ? 700 : 600} s={14.5}>
          {title}
        </T>
        {sub ? (
          <T s={12.5} c="text3">
            {sub}
          </T>
        ) : null}
      </View>
      <Switch on={on} />
    </Press>
  );
}

/**
 * Home and menu section title (21px display, extra bold, slightly tight)
 * with an optional action.
 */
export function SectionTitle({
  title,
  action,
  onAction,
  hint,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  hint?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        },
        style,
      ]}
    >
      <T f="display" w={800} s={21} lh={1.05} ls={-0.02}>
        {title}
      </T>
      {action ? (
        <Press onPress={onAction} hitSlop={8} scaleTo={0.94}>
          <T w={700} s={13} c="accentText" style={{ paddingVertical: 6 }}>
            {action}
          </T>
        </Press>
      ) : typeof hint === "string" ? (
        <T w={500} s={12.5} c="text3">
          {hint}
        </T>
      ) : (
        hint
      )}
    </View>
  );
}

/** Big-icon empty state (Saved, Cart). */
export function EmptyState({
  icon,
  title,
  body,
  cta,
  onCta,
  fill,
}: {
  icon: string;
  title: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
  fill?: boolean;
}) {
  const { c } = useTheme();

  return (
    <View style={{ alignItems: "center", gap: 10, paddingHorizontal: 30 }}>
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          backgroundColor: c.accentSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={38} color={c.accent} fill={fill ? 1 : 0} />
      </View>
      <T f="display" w={800} s={22} ls={-0.02} center>
        {title}
      </T>
      {body ? (
        <T s={14.5} lh={1.5} c="text2" center>
          {body}
        </T>
      ) : null}
      {cta ? (
        <Press
          onPress={onCta}
          scaleTo={0.96}
          haptic="light"
          style={{
            marginTop: 8,
            height: 50,
            paddingHorizontal: 24,
            borderRadius: 25,
            backgroundColor: c.accent,
            justifyContent: "center",
          }}
        >
          <T w={700} s={15} c="accentInk">
            {cta}
          </T>
        </Press>
      ) : null}
    </View>
  );
}

export const hairline = StyleSheet.hairlineWidth;
