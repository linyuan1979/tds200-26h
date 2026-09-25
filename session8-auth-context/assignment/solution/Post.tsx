import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Link } from "expo-router";
import React from "react";
import { PostData } from "@/utils/postData";
import { useAuth } from "@/context/AuthContext";
import { deletePost } from "@/api/postApi";

type PostProps = { postData: PostData };

export default function Post({ postData }: PostProps) {
  const { user } = useAuth();
  const commentCount = postData.comments?.length ?? 0;
  const likeCount = postData.likes?.length ?? 0;
  const firstImage = postData.imageUrls?.[0];

  // Show the delete button only when the signed-in user is the author
  const isAuthor = postData.author === user?.displayName;

  function handleDelete() {
    Alert.alert(
      "Delete post",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePost(postData.id),
        },
      ]
    );
  }

  return (
    <View style={styles.card}>
      <Link
        href={{ pathname: "/postDetails/[id]", params: { id: postData.id, title: postData.title } }}
        asChild
      >
        <TouchableOpacity>
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

        <View style={styles.footerRight}>
          <Text style={styles.author}>{postData.author}</Text>
          {isAuthor && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteText}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
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
  footerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  hashtags: { fontSize: 12, color: "gray" },
  likeCount: { fontSize: 12, color: "#FF3B30" },
  commentCount: { fontSize: 12, color: "#007AFF" },
  imageCount: { fontSize: 12, color: "#555" },
  author: { fontSize: 12, color: "gray", textDecorationLine: "underline" },
  deleteBtn: {
    backgroundColor: "#fff0f0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: { fontSize: 14 },
});
