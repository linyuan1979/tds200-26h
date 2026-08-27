import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: "Home",
          }}
        />
        <Stack.Screen name="postDetails/[id]" />
      </Stack>
      <Toast />
    </>
  );
}
