import { useState, useEffect } from "react";
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
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";

const POSTS_KEY = "tds200_posts";

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const stored = await AsyncStorage.getItem(POSTS_KEY);

    if (stored) {
      setPosts(JSON.parse(stored));
      Toast.show({ type: "info", text1: "Posts fetched from local storage." });
    } else {
      // First launch — seed storage with dummy data.
      const initial = getAllPosts();
      await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(initial));
      setPosts(initial);
      Toast.show({ type: "info", text1: "Posts saved to local storage for the first time." });
    }

    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    const stored = await AsyncStorage.getItem(POSTS_KEY);

    if (stored) {
      setPosts(JSON.parse(stored));
      Toast.show({ type: "info", text1: "Posts refreshed from storage." });
    } else {
      // Storage was cleared — re-seed so the list is never empty.
      const initial = getAllPosts();
      await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(initial));
      setPosts(initial);
      Toast.show({ type: "info", text1: "Storage was empty — posts re-seeded." });
    }

    setRefreshing(false);
  }

  // Removes the posts key from AsyncStorage and clears the list.
  // Pull down to re-seed after clearing.
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
        ListFooterComponent={() => <Spacer height={16} />}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        renderItem={({ item }) => <Post postData={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity style={styles.clearButton} onPress={handleClearStorage}>
        <Text style={styles.clearButtonText}>Clear Posts</Text>
      </TouchableOpacity>
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
