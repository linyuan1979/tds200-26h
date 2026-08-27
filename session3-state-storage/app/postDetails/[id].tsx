import { View, Text, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import React from "react";
import { getPostById } from "@/utils/dummyPostData";

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const post = getPostById(id);

  // useLayoutEffect runs synchronously after the component renders
  // but before the screen is painted on screen.
  // We use it here to update the header title to match the post's title
  // so the user sees the correct title without a flash.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: post?.title ?? "Post Details",
    });
  }, [navigation, post]);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <Text style={styles.title}>PostDetaljer</Text>,
        }}
      />
        <>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.author}>By {post.author}</Text>
          <Text style={styles.description}>{post.description}</Text>
          <Text style={styles.hashtags}>{post.hashtags}</Text>
        </>
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
