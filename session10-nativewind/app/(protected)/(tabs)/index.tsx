import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  FlatList,
  View,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { PostData, NewPostData } from "@/utils/postData";
import { getAllPosts, createPost, getAllMyPosts } from "@/api/postApi";
import { uploadImage } from "@/api/imageApi";
import { useAuth } from "@/context/AuthContext";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";
import PostForm from "@/components/PostForm";

// Session 10: NativeWind replaces StyleSheet on this screen.
// Instead of style={styles.foo}, we use className="tailwind-classes".
// The logic is unchanged from Session 9 — compare the two files side by side.

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // "all" shows every post. "mine" shows only the signed-in user's posts.
  // Home always starts on "all" — the user picks "mine" explicitly.
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");

  // useAuth() gives us the current user from AuthContext.
  const { user } = useAuth();
  const authorName = user?.displayName ?? user?.email ?? "Anonymous";

  // Option 1: create post always visible.
  const canPost = true;

  // Option 2: guests can view Home but can't create posts.

  //const canPost = !!user;

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  // Whenever the screen gains focus (or a filter changes), reload posts.
  useFocusEffect(
    useCallback(() => {
      // Can't show "mine" without a signed-in user — fall back to "all".
      const mode = viewMode === "mine" && !user ? "all" : viewMode;
      if (mode !== viewMode) setViewMode(mode);

      loadPosts(sortOrder, mode);
    }, [sortOrder, viewMode, user])
  );

  async function loadPosts(
    order: "asc" | "desc" = sortOrder,
    mode: "all" | "mine" = viewMode
  ) {
    setLoading(true);

    try {
      if (mode === "mine" && user) {
        const fetched = await getAllMyPosts(authorName, order);
        setPosts(fetched);
        return;
      }

      const fetched = await getAllPosts(order);
      setPosts(fetched);
    } catch (error) {
      console.error("Failed to load posts:", error);
      showToast("Could not load posts.");
    } finally {
      setLoading(false);
    }
  }

  function handleSort() {
    const nextOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(nextOrder);
    loadPosts(nextOrder, viewMode);
  }

  function handleViewToggle() {
    const nextMode = viewMode === "all" ? "mine" : "all";

    if (nextMode === "mine" && !user) {
      showToast("Sign in to see your own posts");
      return;
    }

    setViewMode(nextMode);
    loadPosts(sortOrder, nextMode);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadPosts(sortOrder, viewMode);
    setRefreshing(false);
  }

  async function handleNewPost(post: NewPostData, localImages: string[]) {
    try {
      let imageUrls: string[] = [];
      if (localImages.length > 0) {
        showToast(`Uploading ${localImages.length} image${localImages.length > 1 ? "s" : ""}…`);
        const uploadId = Date.now().toString();
        for (let i = 0; i < localImages.length; i++) {
          const url = await uploadImage(localImages[i], uploadId, i);
          imageUrls.push(url);
        }
      }
      await createPost({ ...post, imageUrls });
      showToast(imageUrls.length > 0 ? "Post with images saved!" : "Post saved!");
      await loadPosts();
    } catch (error) {
      console.error("Failed to save post:", error);
      showToast("Could not save post. Check your connection.");
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator size="large" />
        <Text className="text-sm text-gray-400">Loading posts…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {toast !== null && (
        <View className="m-3 bg-gray-800 rounded-xl p-3">
          <Text className="text-white text-sm text-center">{toast}</Text>
        </View>
      )}

      <View className="flex-row gap-2.5 px-4 pt-3 pb-1">
        <TouchableOpacity
          className="flex-1 bg-gray-600 rounded-lg py-2.5 px-3 items-center"
          onPress={handleSort}
        >
          <Text className="text-white text-sm font-semibold">
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-gray-600 rounded-lg py-2.5 px-3 items-center"
          onPress={handleViewToggle}
        >
          <Text className="text-white text-sm font-semibold">
            {viewMode === "all" ? "All posts" : "My posts"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListHeaderComponent={() => <Spacer height={8} />}
        ListFooterComponent={() => <Spacer height={80} />}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        renderItem={({ item }) => <Post postData={item} />}
        ListEmptyComponent={() => (
          <View className="pt-16 items-center">
            <Text className="text-lg font-bold text-gray-800">
              {viewMode === "mine" ? "You have no posts yet." : "No posts yet."}
            </Text>
            <Text className="mt-2 text-sm text-gray-400">Tap + to create the first one.</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Floating action button */}
      {canPost && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg"
          onPress={() => setFormVisible(true)}
        >
          <Text className="text-white text-3xl leading-8">+</Text>
        </TouchableOpacity>
      )}

      <PostForm
        visible={formVisible}
        authorName={authorName}
        onClose={() => setFormVisible(false)}
        onSubmit={handleNewPost}
      />
    </View>
  );
}
