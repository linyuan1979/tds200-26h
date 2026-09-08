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
import { getAllPosts, createPost } from "@/api/postApi";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";
import PostForm from "@/components/PostForm";

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [authorName, setAuthorName] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadPosts();
      loadAuthor();
    }, [])
  );

  async function loadPosts() {
    const fetched = await getAllPosts();
    setPosts(fetched);
    setLoading(false);
  }

  async function loadAuthor() {
    const stored = await AsyncStorage.getItem(SESSION_USER);
    if (stored) {
      const user: SessionUser = JSON.parse(stored);
      setAuthorName(user.name);
    } else {
      setAuthorName("");
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    const fetched = await getAllPosts();
    setPosts(fetched);
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
            <Text style={styles.emptyText}>No posts yet.</Text>
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
});
