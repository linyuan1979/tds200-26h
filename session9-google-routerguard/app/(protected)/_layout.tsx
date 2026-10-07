import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";

// Protected route group layout.
// Any screen inside app/(protected)/ requires the user to be signed in.
// If not signed in → redirect to /auth.
// If still loading → show spinner while Firebase resolves auth state.
//
// This is declarative: <Redirect /> renders instead of the protected screens,
// rather than the imperative useSegments + useEffect pattern from Session 8.
export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  // Same two guard options as Session 8's app/_layout.tsx, ported to this
  // declarative Redirect + route-group style (segments are one level deeper
  // here since everything is nested under the "(protected)" group).
  //
  // Hooks must run unconditionally on every render (Rules of Hooks), so
  // useSegments() is called here, before the loading early return below.

  // Option 1: every screen in this group requires sign-in (original behavior).
  //const isGuestAllowed = false;

  // Option 2: guests can also view the Home tab; everything else still requires sign-in.
  const segments = useSegments();
  const onHomeScreen = segments[1] === "(tabs)" && segments[2] === undefined;
  const isGuestAllowed = onHomeScreen;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user && !isGuestAllowed) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="postDetails/[id]" options={{ headerBackTitle: "Back" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
