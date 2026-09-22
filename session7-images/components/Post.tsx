import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import React from "react";
import { PostData } from "@/utils/postData";

type PostProps = { postData: PostData };

export default function Post({ postData }: PostProps) {
  const commentCount = postData.comments?.length ?? 0;
  const likeCount = postData.likes?.length ?? 0;
  const firstImage = postData.imageUrls?.[0];

  return (
    <View style={styles.card}>
      <Link
        href={{ pathname: "/postDetails/[id]", params: { id: postData.id, title: postData.title } }}
        asChild
      >
        <TouchableOpacity>
          {/* Show first image as card header if available */}
          {firstImage && (
            <Image source={{ uri: firstImage }} style={styles.cardImage} resizeMode="cover" />
          )}
          <View style={styles.body}>
            <Text style={styles.title}>{postData.title}</Text>
            <Text style={styles.description}>{postData.description}</Text>
          </View>
        </TouchableOpacity> 
      </Link>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.hashtags}>{postData.hashtags}</Text>
          {likeCount > 0 && <Text style={styles.likeCount}>❤️ {likeCount}</Text>}
          {commentCount > 0 && <Text style={styles.commentCount}>💬 {commentCount}</Text>}
          {(postData.imageUrls?.length ?? 0) > 1 && (
            <Text style={styles.imageCount}>🖼 {postData.imageUrls!.length}</Text>
          )}
        </View>
        <Text style={styles.author}>{postData.author}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: { width: "100%", height: 160 },
  body: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 14, color: "gray", marginTop: 6 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  hashtags: { fontSize: 12, color: "gray" },
  likeCount: { fontSize: 12, color: "#FF3B30" },
  commentCount: { fontSize: 12, color: "#007AFF" },
  imageCount: { fontSize: 12, color: "#555" },
  author: { fontSize: 12, color: "gray", textDecorationLine: "underline" },
});
