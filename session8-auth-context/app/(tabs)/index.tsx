import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  FlatList,
  View,
  StyleSheet,
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
  // user is guaranteed non-null here — _layout.tsx redirects to /auth if not signed in.
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
    // Changing sortOrder re-runs useFocusEffect above, which reloads the posts.
    setSortOrder(nextOrder);
  }

  function handleViewToggle() {
    const nextMode = viewMode === "all" ? "mine" : "all";

    if (nextMode === "mine" && !user) {
      showToast("Sign in to see your own posts");
      return;
    }

    // Changing viewMode re-runs useFocusEffect above, which reloads the posts.
    setViewMode(nextMode);
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading posts…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {toast !== null && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.filterButton} onPress={handleSort}>
          <Text style={styles.filterButtonText}>
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={handleViewToggle}>
          <Text style={styles.filterButtonText}>
            {viewMode === "all" ? "All posts" : "My posts"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => <Spacer height={8} />}
        ListFooterComponent={() => <Spacer height={80} />}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        renderItem={({ item }) => <Post postData={item} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {viewMode === "mine" ? "You have no posts yet." : "No posts yet."}
            </Text>
            <Text style={styles.emptyHint}>Tap + to create the first one.</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {canPost && (
        <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
          <Text style={styles.fabIcon}>+</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  list: { paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "gray", fontSize: 14 },
  toast: { margin: 12, backgroundColor: "#333", borderRadius: 10, padding: 12 },
  toastText: { color: "white", fontSize: 13, textAlign: "center" },
  empty: { paddingTop: 60, alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  emptyHint: { marginTop: 8, fontSize: 14, color: "gray" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { color: "white", fontSize: 28, lineHeight: 32 },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#666",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
