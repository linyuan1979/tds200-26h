import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import React from "react";
import { PostData } from "@/utils/postData";
import { SESSION_USER, SessionUser } from "@/utils/userData";
import CommentsSection from "@/components/CommentsSection";

const POSTS_KEY = "tds200_posts";

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  // Who is signed in — used as the author of a new comment.
  const [authorName, setAuthorName] = useState("");

  async function loadPost() {
      const stored = await AsyncStorage.getItem(POSTS_KEY);
      if (stored) {
        const posts: PostData[] = JSON.parse(stored);
        setPost(posts.find((p) => p.id === id) ?? null);
      }
      setLoading(false);
    }
  async function loadAuthor() {
      const stored = await AsyncStorage.getItem(SESSION_USER);
      if (stored) {
        const user: SessionUser = JSON.parse(stored);
        setAuthorName(user.name);
      }
    }

  useEffect(() => {
    loadPost();
    loadAuthor();
  }, []);


  useLayoutEffect(() => {
    navigation.setOptions({ title: post?.title ?? "Post Details" });
  }, [navigation, post]);

  // Add the typed comment to this post, then save the whole posts list back.
  async function handleAddComment(text: string) {
    if (!post) return;

    const newComment = { author: authorName || "Anonymous", text };
    const updatedPost: PostData = {
      ...post,
      comments: [...post.comments, newComment],
    };

    // Update the screen straight away.
    setPost(updatedPost);

    // Persist: read the list, swap in the updated post, write it back.
    const stored = await AsyncStorage.getItem(POSTS_KEY);
    const posts: PostData[] = stored ? JSON.parse(stored) : [];
    const updatedPosts = posts.map((p) => (p.id === post.id ? updatedPost : p));
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));

    Toast.show({ type: "success", text1: "Comment added!" });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
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
        <Text style={styles.hashtags}>{post.hashtags}</Text>

        <CommentsSection
          comments={post.comments}
          onAddComment={handleAddComment}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  author: { fontSize: 14, color: "gray", marginBottom: 16, textDecorationLine: "underline" },
  description: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 16 },
  hashtags: { fontSize: 13, color: "gray" },
  error: { fontSize: 16, color: "red", textAlign: "center", marginTop: 40 },
});
