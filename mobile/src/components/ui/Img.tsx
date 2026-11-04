import { Image, type ImageProps } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/theme/theme";

type Props = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  /**
   * Gradient overlay, e.g.
   * ["rgba(20,16,12,.82)", "rgba(20,16,12,.45)", "rgba(20,16,12,.1)"]
   */
  overlay?: readonly [string, string, ...string[]];
  overlayLocations?: readonly [number, number, ...number[]];
  /** horizontal gradient (CSS 90deg) instead of vertical (180deg) */
  horizontal?: boolean;
  /** CSS background-position; defaults to center */
  position?: ImageProps["contentPosition"];
  opacity?: number;
  transition?: number;
  children?: ReactNode;
  radius?: number;
};

export function Img({
  uri,
  style,
  overlay,
  overlayLocations,
  horizontal,
  position = "center",
  opacity = 1,
  transition = 260,
  children,
  radius,
}: Props) {
  const { c } = useTheme();

  return (
    <View
      style={[
        {
          overflow: "hidden",
          backgroundColor: c.surface2,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, { opacity }]}
        contentFit="cover"
        contentPosition={position}
        transition={transition}
        cachePolicy="memory-disk"
      />
      {overlay ? (
        <LinearGradient
          colors={overlay}
          locations={overlayLocations}
          start={horizontal ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
          end={horizontal ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );
}
