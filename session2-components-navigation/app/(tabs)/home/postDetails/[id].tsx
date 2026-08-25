import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { getPostById } from "@/utils/dummyPostData";

// useLocalSearchParams() reads the [id] segment from the URL.
// When we navigate to /home/postDetails/p1, id will be "p1".
export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = getPostById(id);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.author}>By {post.author}</Text>
      <Text style={styles.description}>{post.description}</Text>
      <Text style={styles.hashtags}>{post.hashtags}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: "gray",
    marginBottom: 16,
    textDecorationLine: "underline",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
  },
  hashtags: {
    fontSize: 13,
    color: "gray",
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 40,
  },
});
