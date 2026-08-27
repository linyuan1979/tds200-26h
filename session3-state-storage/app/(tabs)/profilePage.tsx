 import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "expo-router";
import React from "react";
import { SESSION_USER, SessionUser, clearAllStorage } from "@/utils/userData";

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);

  async function handleSignOut() {
    // removes sessionUser. But all user account still stay in Storage
    await AsyncStorage.removeItem(SESSION_USER);
    setUser(null);
    Toast.show({ type: "info", text1: "Signed out." });
  }

  // Wipe everything from local storage
  async function handleClearAll() {
    await clearAllStorage();
    setUser(null);
    Toast.show({ type: "info", text1: "All local data cleared." });
  }

  // useFocusEffect runs every time this tab gains focus.
  // We read SESSION_USER, so the profile only appears when a user
  // has actually signed in on the Sign in tab.
  useFocusEffect(
    useCallback(() => {
      async function loadUser() {
        const stored = await AsyncStorage.getItem(SESSION_USER);
        setUser(stored ? JSON.parse(stored) : null);
      }
      loadUser();
    }, [])
  );

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.placeholder}>You are not signed in.</Text>
        <Text style={styles.hint}>Go to the Sign in tab to sign in.</Text>

        <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAll}>
          <Text style={styles.clearAllButtonText}>Clear all local data</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      {user.email ? <Text style={styles.email}>{user.email}</Text> : null}

      <TouchableOpacity style={styles.clearButton} onPress={handleSignOut}>
        <Text style={styles.clearButtonText}>Sign out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAll}>
        <Text style={styles.clearAllButtonText}>Clear all local data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    backgroundColor: "#f2f2f7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLetter: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: "gray",
  },
  clearButton: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
  },
  clearButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  clearAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  clearAllButtonText: {
    color: "#FF3B30",
    fontSize: 13,
    fontWeight: "600",
  },
  placeholder: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});
