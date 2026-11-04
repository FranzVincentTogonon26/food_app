import { Text, type StyleProp, type TextStyle } from "react-native";

import glyphs from "@/assets/fonts/glyphmap.json";
import { useTheme } from "@/theme/theme";
import type { Palette } from "@/theme/tokens";

export type IconName = keyof typeof glyphs;

/** Platform share glyph: the iOS share sheet arrow, or Android's share network. */
export const SHARE_ICON: IconName =
  process.env.EXPO_OS === "android" ? "share" : "ios_share";

type Props = {
  name: IconName | (string & {});
  size?: number;
  /** palette key or raw colour; defaults to inheriting text1 */
  color?: keyof Palette | (string & {});
  /** Material Symbols FILL axis: 0 outline, 1 filled */
  fill?: 0 | 1 | boolean;
  style?: StyleProp<TextStyle>;
};

export function Icon({ name, size = 22, color = "text1", fill = 0, style }: Props) {
  const { c } = useTheme();
  const cp = (glyphs as Record<string, number>)[name];
  const col = (c as Record<string, string>)[color] ?? color;

  if (__DEV__ && cp == null) console.warn(`[Icon] missing glyph "${name}"`);

  return (
    <Text
      allowFontScaling={false}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        {
          fontFamily: fill ? "MaterialSymbols-Fill" : "MaterialSymbols-Outline",
          fontSize: size,
          lineHeight: size,
          width: size,
          height: size,
          color: col,
          textAlign: "center",
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {cp != null ? String.fromCodePoint(cp) : ""}
    </Text>
  );
}
