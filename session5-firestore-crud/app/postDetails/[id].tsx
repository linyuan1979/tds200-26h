import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useEffect, useState } from "react";
import React from "react";
import { PostData } from "@/utils/postData";
import { getPostById, updatePost, deletePost } from "@/api/postApi";
import PostForm from "@/components/PostForm";

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);

  // Set the header title to the post's title once the post is loaded.
  useLayoutEffect(() => {
    navigation.setOptions({ title: post?.title ?? "Post Details" });
  }, [navigation, post]);

  useEffect(() => {
    loadPost();
  }, []);

  async function loadPost() {
    setLoading(true);
    const data = await getPostById(id);
    setPost(data);
    setLoading(false);
  }

  async function handleEdit(updated: PostData) {
    await updatePost(id, {
      title: updated.title,
      description: updated.description,
      hashtags: updated.hashtags,
    });
    // Update local state so the screen reflects the change immediately.
    setPost((prev) => (prev ? { ...prev, ...updated } : prev));
    setEditVisible(false);
    router.back();
  }

  function handleDelete() {
    Alert.alert(
      "Delete Post",
      "This will permanently delete the post. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePost(id);
            router.back();
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.author}>By {post.author}</Text>
        <Text style={styles.description}>{post.description}</Text>

        {post.hashtags ? (
          <View style={styles.chipsRow}>
            {post.hashtags.split(" ").filter(Boolean).map((tag) => (
              <View key={tag} style={styles.chip}>
                <Text style={styles.chipText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Edit and Delete buttons at the bottom */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => setEditVisible(true)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Reuse PostForm in edit mode — pre-filled with current post data */}
      <PostForm
        visible={editVisible}
        authorName={post.author}
        initialData={post}
        onClose={() => setEditVisible(false)}
        onSubmit={handleEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  author: { fontSize: 14, color: "gray", marginBottom: 16, textDecorationLine: "underline" },
  description: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 16 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    backgroundColor: "#e8f0fe",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  chipText: { color: "#1a73e8", fontSize: 13, fontWeight: "500" },
  error: { fontSize: 16, color: "red" },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  editButton: { backgroundColor: "#007AFF" },
  deleteButton: { backgroundColor: "#FF3B30" },
  actionButtonText: { color: "white", fontSize: 15, fontWeight: "600" },
});
