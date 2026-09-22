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
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import React from "react";
import { PostData, NewPostData } from "@/utils/postData";
import { SESSION_USER, SessionUser } from "@/utils/userData";
import { getAllPosts, createPost, getAllMyPosts } from "@/api/postApi";
import { uploadImage } from "@/api/imageApi";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";
import PostForm from "@/components/PostForm";

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // "all" shows every post. "mine" shows only the signed-in user's posts.
  // Home always starts on "all" — the user picks "mine" explicitly.
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");

  // Whenever the screen gains focus (or a filter changes), reload posts.
  useFocusEffect(
    useCallback(() => {
      async function loadInitial() {
        setLoading(true);

        const author = await loadAuthor();
        // Can't show "mine" without a signed-in author — fall back to "all".
        const mode = viewMode === "mine" && !author.trim() ? "all" : viewMode;
        if (mode !== viewMode) setViewMode(mode);

        await loadPosts(sortOrder, mode, author);
      }

      loadInitial();
    }, [sortOrder, viewMode])
  );

  async function loadPosts(
    order: "asc" | "desc" = sortOrder,
    mode: "all" | "mine" = viewMode,
    author: string = authorName
  ) {
    setLoading(true);

    try {
      if (mode === "mine" && author.trim()) {
        const fetched = await getAllMyPosts(author.trim(), order);
        setPosts(fetched);
        return;
      }

      const fetched = await getAllPosts(order);
      setPosts(fetched);
    } catch (error) {
      console.error("Failed to load posts:", error);

      Toast.show({
        type: "error",
        text1: "Could not load posts",
        text2:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Reads who is signed in, updates state, and returns the name so callers
  // can use it immediately without waiting on a state update.
  async function loadAuthor(): Promise<string> {
    const stored = await AsyncStorage.getItem(SESSION_USER);
    const name = stored ? (JSON.parse(stored) as SessionUser).name : "";
    setAuthorName(name);
    return name;
  }

  async function handleSort() {
    const nextOrder = sortOrder === "desc" ? "asc" : "desc";

    setSortOrder(nextOrder);
    await loadPosts(nextOrder, viewMode, authorName);
  }

  async function handleViewToggle() {
    const nextMode = viewMode === "all" ? "mine" : "all";

    if (nextMode === "mine" && !authorName.trim()) {
      Toast.show({ type: "error", text1: "Sign in to see your own posts" });
      return;
    }

    setViewMode(nextMode);
    await loadPosts(sortOrder, nextMode, authorName);
  }

  async function handleRefresh() {
    setRefreshing(true);
    const author = await loadAuthor();
    await loadPosts(sortOrder, viewMode, author);
    setRefreshing(false);
  }

  // CREATE POST — if the user selected images, upload them to Firebase Storage
  // first to get permanent download URLs, then create the Firestore document.
  async function handleNewPost(post: NewPostData, localImages: string[]) {
    try {
      let imageUrls: string[] = [];

      if (localImages.length > 0) {
        Toast.show({
          type: "info",
          text1: `Uploading ${localImages.length} image${localImages.length > 1 ? "s" : ""}…`,
        });
        const uploadId = Date.now().toString();
        for (let i = 0; i < localImages.length; i++) {
          const url = await uploadImage(localImages[i], uploadId, i);
          imageUrls.push(url);
        }
      }

      await createPost({ ...post, imageUrls });

      Toast.show({
        type: "success",
        text1: imageUrls.length > 0 ? "Post with images saved!" : "Post saved!",
      });
      await loadPosts();
    } catch (error) {
      console.error("Failed to save post:", error);
      Toast.show({
        type: "error",
        text1: "Could not save post.",
        text2:
          error instanceof Error ? error.message : "Check your connection.",
      });
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

      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  list: { paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "gray", fontSize: 14 },
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
