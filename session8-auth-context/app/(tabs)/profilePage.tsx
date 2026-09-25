import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "../../api/authApi";

export default function ProfilePage() {
  // useAuth() reads from AuthContext — reactive, re-renders if auth state changes.
  // user is guaranteed non-null here because _layout.tsx guards this screen.
  const { user } = useAuth();
  const router = useRouter();
  if (!user) return null;

  const initial = (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase();

  async function handleSignOut() {
    // Navigate to Home first, then sign out. If we sign out first, the auth
    // state change fires while we're still on this (protected) screen, and
    // _layout.tsx's redirect effect sends us to /auth before this function
    // gets a chance to navigate anywhere itself.
    router.replace("/");
    await signOutUser();
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>{initial}</Text>
      </View>

      <Text style={styles.name}>{user.displayName ?? "No name set"}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.uid}>UID: {user.uid.slice(0, 10)}…</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>SIGN-IN METHOD</Text>
        <Text style={styles.infoValue}>Email / Password</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLetter: { color: "white", fontSize: 36, fontWeight: "bold" },
  name: { fontSize: 26, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 15, color: "gray", marginBottom: 4 },
  uid: { fontSize: 12, color: "#bbb", marginBottom: 24 },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "85%",
    marginBottom: 32,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "gray",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: { fontSize: 16, fontWeight: "500" },
  signOutButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
  },
  signOutText: { color: "white", fontSize: 15, fontWeight: "600" },
});
