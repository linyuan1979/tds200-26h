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
import { PostData } from "@/utils/postData";
import { SESSION_USER, SessionUser } from "@/utils/userData";
import { getAllPosts, createPost, getAllMyPosts} from "@/api/postApi";
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

  // Whenever the screen gains focus (or the sort order changes), load signed in user
  // and load their posts for them.
  useFocusEffect(
    useCallback(() => {
      async function loadInitial() {
        setLoading(true);

        const author = await loadAuthor();
        await loadPosts(sortOrder, author);
      }

      loadInitial();
    }, [sortOrder])
  );

  // Show all posts when no one is signed in.
  // Show only the signed-in user's posts otherwise.
  async function loadPosts(
    order: "asc" | "desc" = sortOrder,
    author: string = authorName
  ) {
    setLoading(true);
    try {
      if (!author?.trim()) {
        const fetched = await getAllPosts(order);
        setPosts(fetched);
        return;
      }
      const fetched = await getAllMyPosts(author.trim(), order);
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
    await loadPosts(nextOrder, authorName);
  }

  async function handleRefresh() {
    setRefreshing(true);
    const author = await loadAuthor();
    await loadPosts(sortOrder, author);
    setRefreshing(false);
  }

  async function handleNewPost(post: PostData) {
    await createPost({
      title: post.title,
      description: post.description,
      hashtags: post.hashtags,
      author: post.author,
    });
    Toast.show({ type: "success", text1: "Post saved!" });
    await loadPosts();
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
              {authorName ? "You have no posts yet." : "No posts yet."}
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
