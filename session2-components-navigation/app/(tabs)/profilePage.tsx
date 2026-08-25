import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function ProfilePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.body}>Your profile will appear here in a later session.</Text>
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
