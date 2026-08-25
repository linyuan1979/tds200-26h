import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React from "react";

// This Stack navigator lives inside the Home tab.
// It controls navigation between the post list and the post detail screen.
//
// headerRight adds a Settings button to the Posts screen header.
// Pressing it calls router.push() to navigate to a screen that lives
// outside the Drawer — this shows how a Stack push overlays the entire navigator.
export default function HomeLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Posts",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/settingsScreen")}>
              <AntDesign name="setting" size={22} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="postDetails/[id]"
        options={{
          title: "Post Details",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign name="arrowleft" size={22} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
