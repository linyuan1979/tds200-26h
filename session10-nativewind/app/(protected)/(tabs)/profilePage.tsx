import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/api/authApi";

// Session 10: NativeWind replaces StyleSheet on this screen.
export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const initial = (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase();
  const provider = user.providerData[0]?.providerId === "google.com" ? "Google" : "Email / Password";

  async function handleSignOut() {
    await signOutUser();
  }

  return (
    <View className="flex-1 items-center pt-14 bg-gray-100">
      {/* Avatar */}
      <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-4">
        <Text className="text-white text-4xl font-bold">{initial}</Text>
      </View>

      {/* Name and email */}
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        {user.displayName ?? "No name set"}
      </Text>
      <Text className="text-sm text-gray-500 mb-1">{user.email}</Text>
      <Text className="text-xs text-gray-300 mb-6">UID: {user.uid.slice(0, 10)}…</Text>

      {/* Info card */}
      <View className="bg-white rounded-xl p-4 w-[85%] mb-8">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Sign-in method
        </Text>
        <Text className="text-base font-medium text-gray-800">{provider}</Text>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        className="bg-red-500 rounded-xl px-10 py-4"
        onPress={handleSignOut}
      >
        <Text className="text-white text-base font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
