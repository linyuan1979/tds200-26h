import { Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="authenticationPage"
        options={{
          title: "Sign in",
          tabBarIcon: ({ color }: { color: string }) => (
            <AntDesign name="login" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
