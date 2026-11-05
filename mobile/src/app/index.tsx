import { StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Controls";
import { T } from "@/components/ui/Text";
import { money } from "@/lib/format";
import { cartCount, totals } from "@/store/selectors";
import { useApp } from "@/store/store";
import { useTheme } from "@/theme/theme";

/**
 * A first screen to prove the app runs. The home screen replaces it once the
 * tabs exist.
 */
export default function Hello() {
  const { c } = useTheme();

  // a quick test of the app's memory: dishes, bag size and bag total
  const dishes = useApp((s) => s.menu.length);
  const inBag = useApp(cartCount);
  const total = useApp((s) => totals(s).total);
  const addLine = useApp((s) => s.addLine);

  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      <T f="display" w={800} s={32}>
        Ember Kitchen
      </T>
      <T s={14} c="text2">
        {dishes} dishes • {inBag} in the bag • {money(total)}
      </T>
      <Button
        label="Add a Margherita"
        onPress={() => addLine({ id: "marg", s: 1, ex: [], q: 1 })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
});
