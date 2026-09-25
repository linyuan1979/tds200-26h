import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// RootNavigator is a separate component so it can call useAuth().
// useAuth() only works inside a component that is a child of AuthProvider.
function RootNavigator() {
  const { user, loading } = useAuth();

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const onAuthScreen = segments[0] === "auth";

    // Option 1: everything except /auth requires sign-in (original behavior).
    const isProtectedRoute = !onAuthScreen;

    // Option 2: guests can also view the Home tab; everything else still requires sign-in.

     //const onHomeScreen = segments[0] === "(tabs)" && segments[1] === undefined;
     //const isProtectedRoute = !onAuthScreen && !onHomeScreen;

    if (!user && isProtectedRoute) {
      router.replace("/auth");
    } else if (user && onAuthScreen) {
      router.replace("/");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: "" }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="postDetails/[id]" options={{ headerBackTitle: "Back" }} />
    </Stack>
  );
}

// RootLayout wraps everything in AuthProvider so every screen can call useAuth().
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
