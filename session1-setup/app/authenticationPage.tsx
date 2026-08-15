import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function AuthenticationPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign In</Text>
      <Text style={styles.body}>Authentication will be added in Session 8.</Text>
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
    marginTop: 8,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});
