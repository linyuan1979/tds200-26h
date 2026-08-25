import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  body: {
    marginTop: 12,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    lineHeight: 22,
  },
  code: {
    fontFamily: "monospace",
    color: "#007AFF",
  },
});
