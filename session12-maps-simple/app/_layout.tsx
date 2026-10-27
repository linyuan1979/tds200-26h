import "../global.css";
import { Stack } from "expo-router";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";

// QueryClient holds the shared cache used by every useQuery / useMutation call.
// One QueryClient per app — created outside the component so it is never re-created on re-render.
const queryClient = new QueryClient();

// Root layout: wraps the whole app in QueryClientProvider (React Query) and AuthProvider.
// Routing guard logic lives in app/(protected)/_layout.tsx — this file has no auth logic.
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="redirect" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
