import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { PostData, NewPostData, CommentObject } from "@/utils/postData";
import { getPostById, updatePost, deletePost, toggleLike } from "@/api/postApi";
import { addComment, getCommentsByIds, deleteComment, deleteCommentsByIds } from "@/api/commentApi";
import { useAuth } from "@/context/AuthContext";
import PostForm from "@/components/PostForm";
import CommentForm from "./CommentForm";

const LIKE_GOAL = 10;

export default function PostDetailsScreen() {
  const { id, title: routeTitle } = useLocalSearchParams<{ id: string; title: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [commentFormVisible, setCommentFormVisible] = useState(false);
  const [comments, setComments] = useState<CommentObject[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const { user } = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({ title: post?.title ?? routeTitle ?? "Post Details" });
  }, [navigation, post, routeTitle]);

  useEffect(() => {
    if (id) loadPost();
  }, [id]);

  async function loadPost() {
    setLoading(true);
    const data = await getPostById(id);
    setPost(data);
    setLoading(false);
    if (data?.comments?.length) {
      loadComments(data.comments);
    }
  }

  async function loadComments(ids: string[]) {
    setCommentsLoading(true);
    const loaded = await getCommentsByIds(ids);
    setComments(loaded);
    setCommentsLoading(false);
  }

  async function handleToggleLike() {
    if (!post || !user) return;
    const currentLikes = post.likes ?? [];
    const alreadyLiked = currentLikes.includes(user.uid);
    const newLikes = alreadyLiked
      ? currentLikes.filter((uid) => uid !== user.uid)
      : [...currentLikes, user.uid];
    setPost((prev) => (prev ? { ...prev, likes: newLikes } : prev));
    await toggleLike(post.id, user.uid, alreadyLiked);
  }

  async function handleAddComment(text: string) {
    if (!post || !user) return;
    const result = await addComment(post.id, text);
    if (result) {
      setComments((prev) => [result, ...prev]);
      setPost((prev) =>
        prev ? { ...prev, comments: [...(prev.comments ?? []), result.id] } : prev
      );
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!post) return;
    await deleteComment(commentId, post.id);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPost((prev) =>
      prev
        ? { ...prev, comments: (prev.comments ?? []).filter((cid) => cid !== commentId) }
        : prev
    );
  }

  async function handleEdit(updated: NewPostData) {
    await updatePost(id, updated);
    setPost((prev) => (prev ? { ...prev, ...updated } : prev));
    setEditVisible(false);
  }

  function handleDelete() {
    if (Platform.OS === "web") {
      if (window.confirm("This will permanently delete the post. Continue?")) {
        deleteCommentsByIds(post?.comments ?? [])
          .then(() => deletePost(id))
          .then(() => router.back());
      }
      return;
    }
    Alert.alert(
      "Delete Post",
      "This will permanently delete the post. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCommentsByIds(post?.comments ?? []);
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

  const likes = post.likes ?? [];
  const likeCount = likes.length;
  const isLiked = !!user && likes.includes(user.uid);
  // Part 1: only true when the signed-in user is the post author
  const isOwner = !!user && post.authorId === user.uid;
  const progress = Math.min(likeCount / LIKE_GOAL, 1);
  const remaining = Math.max(LIKE_GOAL - likeCount, 0);
  const imageUrls = post.imageUrls ?? [];

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

        {imageUrls.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
            contentContainerStyle={styles.imageScrollContent}
          >
            {imageUrls.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.detailImage} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

        <View style={styles.likeSection}>
          <TouchableOpacity style={styles.likeButton} onPress={handleToggleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? "#FF3B30" : "#8e8e93"}
            />
            <Text style={[styles.likeLabel, isLiked && styles.likeLabelActive]}>
              {isLiked ? "Unlike" : "Like"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.likeCount}>
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </Text>
        </View>

        {likeCount > 0 && (
          <Text style={styles.likedBy}>Liked by {likes.join(", ")}</Text>
        )}

        <View style={styles.scoreSection}>
          <View style={styles.scoreLabelRow}>
            <Text style={styles.scoreLabel}>❤️ Likes</Text>
            <Text style={styles.scoreValue}>{likeCount} / {LIKE_GOAL}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%` as `${number}%`,
                  backgroundColor: progress >= 1 ? "#34C759" : "#FF3B30",
                },
              ]}
            />
          </View>
          {remaining > 0 ? (
            <Text style={styles.scoreHint}>{remaining} more {remaining === 1 ? "like" : "likes"} to reach the goal</Text>
          ) : (
            <Text style={[styles.scoreHint, { color: "#34C759" }]}>Goal reached! 🎉</Text>
          )}
        </View>

        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
            <TouchableOpacity
              style={styles.addCommentButton}
              onPress={() => setCommentFormVisible(true)}
            >
              <Text style={styles.addCommentText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {commentsLoading ? (
            <ActivityIndicator size="small" style={{ marginTop: 8 }} />
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
          ) : (
            comments.map((item) => (
              <View key={item.id} style={styles.commentCard}>
                <View style={styles.commentBody}>
                  <Text style={styles.commentAuthor}>{item.comment.authorName}</Text>
                  <Text style={styles.commentText}>{item.comment.comment}</Text>
                </View>
                {/* Part 2: only show ✕ when the signed-in user wrote this comment */}
                {item.comment.authorId === user?.uid && (
                  <TouchableOpacity
                    style={styles.deleteCommentButton}
                    onPress={() => handleDeleteComment(item.id)}
                  >
                    <Text style={styles.deleteCommentText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Part 1: only show Edit/Delete when the signed-in user owns the post */}
      {isOwner && (
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
      )}

      <PostForm
        visible={editVisible}
        authorName={post.author}
        initialData={post}
        onClose={() => setEditVisible(false)}
        onSubmit={handleEdit}
      />

      <CommentForm
        visible={commentFormVisible}
        onClose={() => setCommentFormVisible(false)}
        onSubmit={handleAddComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  author: { fontSize: 14, color: "gray", marginBottom: 14, textDecorationLine: "underline" },
  description: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 16 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { backgroundColor: "#e8f0fe", borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  chipText: { color: "#1a73e8", fontSize: 13, fontWeight: "500" },
  error: { fontSize: 16, color: "red" },
  imageScroll: { marginBottom: 20 },
  imageScrollContent: { gap: 10 },
  detailImage: { width: 260, height: 200, borderRadius: 12 },
  likeSection: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 6,
  },
  likeButton: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: "#e0e0e0",
  },
  likeLabel: { fontSize: 14, color: "#8e8e93", fontWeight: "500" },
  likeLabelActive: { color: "#FF3B30" },
  likeCount: { fontSize: 14, fontWeight: "600", color: "#333" },
  likedBy: { fontSize: 12, color: "gray", marginBottom: 16, marginTop: 2 },
  scoreSection: {
    backgroundColor: "#f2f2f7", borderRadius: 12,
    padding: 16, marginTop: 16, marginBottom: 24,
  },
  scoreLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  scoreLabel: { fontSize: 13, fontWeight: "600", color: "gray", textTransform: "uppercase" },
  scoreValue: { fontSize: 13, fontWeight: "700", color: "#333" },
  progressTrack: {
    height: 8, backgroundColor: "#ddd",
    borderRadius: 4, overflow: "hidden", marginBottom: 8,
  },
  progressFill: { height: 8, borderRadius: 4 },
  scoreHint: { fontSize: 12, color: "gray" },
  commentsSection: { marginTop: 4 },
  commentsHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  commentsTitle: { fontSize: 17, fontWeight: "700" },
  addCommentButton: {
    backgroundColor: "#007AFF", borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  addCommentText: { color: "white", fontSize: 13, fontWeight: "600" },
  noComments: { fontSize: 14, color: "gray", marginTop: 4 },
  commentCard: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "#f2f2f7", borderRadius: 10,
    padding: 12, marginBottom: 8, gap: 8,
  },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  commentText: { fontSize: 14, color: "#333" },
  deleteCommentButton: {
    padding: 4, borderRadius: 12,
    backgroundColor: "#FF3B30", alignSelf: "flex-start",
  },
  deleteCommentText: { color: "white", fontSize: 12, fontWeight: "bold" },
  actions: {
    flexDirection: "row", gap: 12, padding: 16,
    borderTopWidth: 1, borderTopColor: "#f0f0f0",
  },
  actionButton: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center" },
  editButton: { backgroundColor: "#007AFF" },
  deleteButton: { backgroundColor: "#FF3B30" },
  actionButtonText: { color: "white", fontSize: 15, fontWeight: "600" },
});
