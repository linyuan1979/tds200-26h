// Home feed: Firestore posts (fetched on focus), local search, and sorting.
//
// LOCAL search — filters the already-loaded posts array in memory.
//   No network request. Fast. Works offline once posts are loaded.
//   Implemented with .filter() on the posts array.
//
// SORT — sorting is done by Firestore itself via orderBy("createdAt", sortOrder).
// Changing sortOrder reloads with a new query — same method as session9's
// loadPosts(order)/handleSort().

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
import { getAllPosts, createPost } from "@/api/postApi";
import { uploadImage } from "@/api/imageApi";
import { useAuth } from "@/context/AuthContext";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";
import PostForm from "@/components/PostForm";
import SearchBar from "@/components/SearchBar";
import SortButton from "@/components/SortButton";

export default function HomeScreen() {
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Local search state
  const [searchText, setSearchText] = useState("");

  // Sort state — determines the order Firestore returns posts in.
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { user } = useAuth();
  const authorName = user?.displayName ?? user?.email ?? "Anonymous";

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  // Whenever the screen gains focus (or sortOrder changes), reload posts.
  useFocusEffect(
    useCallback(() => {
      loadPosts(sortOrder);
    }, [sortOrder])
  );

  async function loadPosts(order: "asc" | "desc" = sortOrder) {
    setLoading(true);
    try {
      const fetched = await getAllPosts(order);
      setAllPosts(fetched);
    } catch (error) {
      console.error("Failed to load posts:", error);
      showToast("Could not load posts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleSort(nextOrder: "asc" | "desc") {
    setSortOrder(nextOrder);
    loadPosts(nextOrder);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadPosts(sortOrder);
  }

  async function handleNewPost(post: NewPostData, localImages: string[]) {
    try {
      let imageUrls: string[] = [];
      if (localImages.length > 0) {
        showToast(`Uploading ${localImages.length} image${localImages.length > 1 ? "s" : ""}…`);
        const uploadId = Date.now().toString();
        for (let i = 0; i < localImages.length; i++) {
          const url = await uploadImage(localImages[i], user!.uid, uploadId, i);
          imageUrls.push(url);
        }
      }
      await createPost({ ...post, imageUrls });
      showToast(imageUrls.length > 0 ? "Post with images saved!" : "Post saved!");
      await loadPosts();
    } catch (error) {
      showToast("Could not save post. Check your connection.");
    }
  }

  // Local text filter — runs entirely in memory, no network request.
  // Matches against title, description, and hashtags fields.
  // allPosts already arrives in sortOrder from the Firestore query, and
  // .filter() preserves that order, so no extra client-side sort is needed.
  const displayedPosts =
    searchText.trim() === ""
      ? allPosts
      : allPosts.filter((p) => {
          const needle = searchText.toLowerCase();
          return (
            p.title.toLowerCase().includes(needle) ||
            p.description.toLowerCase().includes(needle) ||
            p.hashtags.toLowerCase().includes(needle)
          );
        });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator size="large" />
        <Text className="text-gray-400 text-sm">Connecting to Firestore…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {toast !== null && (
        <View className="mx-3 mt-3 bg-gray-800 rounded-xl px-4 py-3">
          <Text className="text-white text-sm text-center">{toast}</Text>
        </View>
      )}

      {/* Local search bar — filters the current post list by text */}
      <SearchBar value={searchText} onChangeText={setSearchText} />

      {/* Sort button — re-queries Firestore in the new order */}
      <View className="px-4 pb-1">
        <SortButton value={sortOrder} onChange={handleSort} />
      </View>

      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListHeaderComponent={() => <Spacer height={8} />}
        ListFooterComponent={() => <Spacer height={80} />}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        renderItem={({ item }) => <Post postData={item} />}
        ListEmptyComponent={() => (
          <View className="pt-16 items-center">
            {searchText.trim() !== "" ? (
              <>
                <Text className="text-lg font-bold text-gray-800">No results.</Text>
                <Text className="mt-2 text-sm text-gray-400">
                  Try a different search term.
                </Text>
              </>
            ) : (
              <>
                <Text className="text-lg font-bold text-gray-800">No posts yet.</Text>
                <Text className="mt-2 text-sm text-gray-400">Tap + to create the first one.</Text>
              </>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Floating action button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg"
        onPress={() => setFormVisible(true)}
      >
        <Text className="text-white text-3xl leading-8">+</Text>
      </TouchableOpacity>

      <PostForm
        visible={formVisible}
        authorName={authorName}
        onClose={() => setFormVisible(false)}
        onSubmit={handleNewPost}
      />
    </View>
  );
}
