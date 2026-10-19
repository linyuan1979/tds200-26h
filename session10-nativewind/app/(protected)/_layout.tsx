import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";

// Protected route group layout — same guard as Session 9.
// Any screen inside app/(protected)/ requires the user to be signed in.
// If not signed in → redirect to /auth.
// If still loading → show spinner while Firebase resolves auth state.
//
// Session 10: only the styling changed (NativeWind className instead of StyleSheet).
export default function ProtectedLayout() {
  const { user, loading } = useAuth();

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
      <View className="flex-1 items-center justify-center">
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
