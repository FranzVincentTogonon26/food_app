import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { Roboto_500Medium } from "@expo-google-fonts/roboto/500Medium";

export const fontAssets = {
  "DMSans-400": DMSans_400Regular,
  "DMSans-500": DMSans_500Medium,
  "DMSans-600": DMSans_600SemiBold,
  "DMSans-700": DMSans_700Bold,

  "Roboto-500": Roboto_500Medium,

  "Bricolage-600-16": require("@/assets/fonts/Bricolage-600-16.ttf"),
  "Bricolage-600-24": require("@/assets/fonts/Bricolage-600-24.ttf"),
  "Bricolage-600-40": require("@/assets/fonts/Bricolage-600-40.ttf"),
  "Bricolage-700-16": require("@/assets/fonts/Bricolage-700-16.ttf"),
  "Bricolage-700-24": require("@/assets/fonts/Bricolage-700-24.ttf"),
  "Bricolage-700-40": require("@/assets/fonts/Bricolage-700-40.ttf"),
  "Bricolage-800-16": require("@/assets/fonts/Bricolage-800-16.ttf"),
  "Bricolage-800-24": require("@/assets/fonts/Bricolage-800-24.ttf"),
  "Bricolage-800-40": require("@/assets/fonts/Bricolage-800-40.ttf"),

  "MaterialSymbols-Outline": require("@/assets/fonts/MaterialSymbolsOutline.ttf"),
  "MaterialSymbols-Fill": require("@/assets/fonts/MaterialSymbolsFill.ttf"),
};

export type BodyWeight = 400 | 500 | 600 | 700 | 800;
export type DisplayWeight = 600 | 700 | 800;

export function bodyFamily(weight: BodyWeight): string {
  const w = weight >= 700 ? 700 : weight;
  return `DMSans-${w}`;
}

export function displayFamily(weight: DisplayWeight, size: number): string {
  const opsz = size <= 18 ? 16 : size <= 26 ? 24 : 40;
  return `Bricolage-${weight}-${opsz}`;
}
