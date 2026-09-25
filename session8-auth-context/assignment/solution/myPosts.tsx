import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import React from "react";
import { PostData } from "@/utils/postData";
import { getAllPosts } from "@/api/postApi";
import { useAuth } from "@/context/AuthContext";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";

export default function MyPostsScreen() {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadMyPosts();
    }, [user?.displayName])
  );

  async function loadMyPosts() {
    setLoading(true);
    const all = await getAllPosts();
    setMyPosts(all.filter((p) => p.author === user?.displayName));
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stretch goal: post count subtitle */}
      <Text style={styles.count}>
        {myPosts.length} post{myPosts.length !== 1 ? "s" : ""}
      </Text>

      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => <Spacer height={8} />}
        ListFooterComponent={() => <Spacer height={32} />}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        renderItem={({ item }) => <Post postData={item} />}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No posts yet.</Text>
            <Text style={styles.emptyHint}>
              Create your first post on the Home tab.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  count: {
    fontSize: 13,
    color: "gray",
    textAlign: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  list: { paddingHorizontal: 16 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 8 },
  emptyHint: { fontSize: 14, color: "gray", textAlign: "center" },
});
