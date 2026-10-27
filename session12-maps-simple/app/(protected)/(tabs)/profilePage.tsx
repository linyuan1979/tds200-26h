import { FlatList, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/api/authApi";
import { useMyPostsQuery } from "@/hooks/usePostsQuery";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";
import SortButton from "@/components/SortButton";

export default function ProfilePage() {
  const { user } = useAuth();

  // Sort state — determines the order getMyPosts returns posts in.
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Remote query: fetch only this user's posts from Firestore.
  // useMyPostsQuery is disabled until user.uid is available.
  const { data: myPosts, isLoading, isError } = useMyPostsQuery(user?.uid, sortOrder);

  if (!user) return null;

  const initial = (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase();
  const provider = user.providerData[0]?.providerId === "google.com" ? "Google" : "Email / Password";

  async function handleSignOut() {
    await signOutUser();
  }

  // Arrow function (not `function`) so TypeScript knows `user` is non-null here.
  const ProfileHeader = () => {
    return (
      <View className="items-center pt-14 pb-4">
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
        <View className="bg-white rounded-xl p-4 w-[85%] mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Sign-in method
          </Text>
          <Text className="text-base font-medium text-gray-800">{provider}</Text>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          className="bg-red-500 rounded-xl px-10 py-4 mb-8"
          onPress={handleSignOut}
        >
          <Text className="text-white text-base font-semibold">Sign Out</Text>
        </TouchableOpacity>

        {/* My Posts section heading + sort button */}
        <View className="w-full px-4 pb-2 border-t border-gray-200 pt-4 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-900">
            My Posts {myPosts !== undefined && `(${myPosts.length})`}
          </Text>
          <SortButton value={sortOrder} onChange={setSortOrder} />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-100">
        <ProfileHeader />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="text-gray-400 text-sm mt-2">Loading your posts…</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-100">
        <ProfileHeader />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-400 text-sm">Could not load your posts.</Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-gray-100"
      data={myPosts ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      ListHeaderComponent={<ProfileHeader />}
      ItemSeparatorComponent={() => <Spacer height={12} />}
      ListFooterComponent={() => <Spacer height={40} />}
      renderItem={({ item }) => <Post postData={item} />}
      ListEmptyComponent={() => (
        <View className="pt-8 items-center">
          <Text className="text-base text-gray-400">You have no posts yet.</Text>
        </View>
      )}
    />
  );
}
