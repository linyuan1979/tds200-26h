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
import { getAllPosts } from "@/utils/dummyPostData";
import { SESSION_USER, SessionUser } from "@/utils/userData";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";
import PostForm from "@/components/PostForm";

const POSTS_KEY = "tds200_posts";

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [authorName, setAuthorName] = useState("");

  // Re-run when the Home tab regains focus, so signing in on the
  // Sign In tab updates the author straight away.
  useFocusEffect(
    useCallback(() => {
      loadPosts();
      loadAuthor();
    }, [])
  );


  // Load the signed-in user's name so PostForm can show it as the author.
  async function loadAuthor() {
    const stored = await AsyncStorage.getItem(SESSION_USER);
    if (stored) {
      const user: SessionUser = JSON.parse(stored);
      setAuthorName(user.name);
    } else {
      setAuthorName("");
    }
  }
    
  async function getStoredPosts(): Promise<PostData[]> {
    const stored = await AsyncStorage.getItem(POSTS_KEY);

    if (stored) {
      return JSON.parse(stored);
    }

    // If storage is empty, seed it with the initial posts.
    const initial = getAllPosts();

    await AsyncStorage.setItem(
      POSTS_KEY,
      JSON.stringify(initial)
    );

    return initial;
  }

  async function loadPosts() {
    const posts = await getStoredPosts();
    setPosts(posts);
    setLoading(false);
  }


  async function handleRefresh() {
    setRefreshing(true);
    const posts = await getStoredPosts();
    setPosts(posts);
    setRefreshing(false);
    Toast.show({ type: "info", text1: "Posts refreshed from local storage." });
  }

  // Prepend the new post to state and persist the updated list to AsyncStorage.
  async function handleNewPost(post: PostData) {
    const updated = [post, ...posts];
    setPosts(updated);
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    Toast.show({ type: "success", text1: "Post saved!" });
  }

  async function handleClearStorage() {
    await AsyncStorage.removeItem(POSTS_KEY);
    setPosts([]);
    Toast.show({ type: "info", text1: "Storage cleared. Pull down to re-seed." });
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* FAB — Floating Action Button to open the post creation modal */}
      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearStorage}>
        <Text style={styles.clearButtonText}>Clear AsyncStorage</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  list: {
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "gray",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: 72,
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
  fabIcon: {
    color: "white",
    fontSize: 28,
    lineHeight: 32,
  },
  clearButton: {
    margin: 16,
    padding: 14,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
