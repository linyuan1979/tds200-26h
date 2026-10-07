import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";

// Root layout: wraps the whole app in AuthProvider and declares the top-level screens.
// Auth guard logic lives in app/(protected)/_layout.tsx — this file has no auth logic.
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="redirect" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
