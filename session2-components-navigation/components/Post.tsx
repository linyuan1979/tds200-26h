import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import React from "react";
import { PostData } from "@/utils/postData";

// A reusable component receives data through props.
// This component knows how to render one post — the parent decides which post to give it.
type PostProps = {
  postData: PostData;
};

export default function Post({ postData }: PostProps) {
  return (
    <View style={styles.card}>
      {/* Link navigates to the detail screen, passing the post id as a route parameter */}
      <Link
        href={{
          pathname: "/home/postDetails/[id]",
          params: { id: postData.id },
        }}
      >
        <Text style={styles.title}>{postData.title}</Text>
        <Text style={styles.description}>{postData.description}</Text>
      </Link>

      <View style={styles.footer}>
        <Text style={styles.hashtags}>{postData.hashtags}</Text>
        <Text style={styles.author}>{postData.author}</Text>
      </View>
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
});
