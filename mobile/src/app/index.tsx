import { StyleSheet, Text, View } from "react-native";

export default function Hello() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Food App Kitchen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F3EE",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1410",
  },
});
