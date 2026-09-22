import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Link } from "expo-router";
import React from "react";
import { PostData } from "@/utils/postData";
import { useState } from "react";
import { AntDesign } from "@expo/vector-icons";

// A reusable component receives data through props.
// This component knows how to render one post — the parent decides which post to give it.
type PostProps = {
  postData: PostData;
};

export default function Post({ postData }: PostProps) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.card}>
      {/* Link navigates to the detail screen, passing the post id as a route parameter */}
      <Link
        href={{
          pathname: "/home/postDetails/[id]",
          params: { id: postData.id },
        }}
        asChild
      >
        <TouchableOpacity>
          <Text style={styles.title}>{postData.title}</Text>
          <Text style={styles.description}>{postData.description}</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.footer}>
        <Text style={styles.hashtags}>{postData.hashtags}</Text>
        <Text style={styles.author}>{postData.author}</Text>
      </View>

      <Pressable
        style={styles.likeButton}
        onPress={() => setLiked(!liked)}
      >
        <AntDesign name={liked ? "heart" : "hearto"} size={22} color="#FF0000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "gray",
    marginTop: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  hashtags: {
    fontSize: 12,
    color: "gray",
  },
  author: {
    fontSize: 12,
    color: "gray",
    textDecorationLine: "underline",
  },
    likeButton: {
    marginTop: 12,
    padding: 8,
    borderRadius: 5,
    backgroundColor: "lightgray",
  },
});
