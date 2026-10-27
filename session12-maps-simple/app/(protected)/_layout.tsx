import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";

// Protected route group layout.
// Any screen inside app/(protected)/ requires the user to be signed in.
// If not signed in → redirect to /auth.
// If still loading → show spinner while Firebase resolves auth state.
//
// Compare with Session 9: that version used useSegments + useEffect in _layout.tsx.
// This version is declarative: <Redirect /> renders instead of the protected screens.
export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="postDetails/[id]" options={{ headerBackTitle: "Back" }} />
    </Stack>
  );
}
