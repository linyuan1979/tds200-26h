import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="postDetails/[id]"
          // "minimal" shows only the back arrow, no label — otherwise iOS
          // would show the previous route's name ("(tabs)") next to the arrow.
          options={{ headerBackButtonDisplayMode: "minimal" }}
        />
      </Stack>
      <Toast />
    </>
  );
}
