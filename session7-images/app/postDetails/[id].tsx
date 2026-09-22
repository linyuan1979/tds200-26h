import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter, useFocusEffect } from "expo-router";
import { useLayoutEffect, useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PostData, NewPostData, CommentData, CommentObject } from "@/utils/postData";
import { SESSION_USER, SessionUser } from "@/utils/userData";
import { getPostById, updatePost, deletePost, toggleLike } from "@/api/postApi";
import { addComment, getCommentsByIds, updateComment, deleteComment, deleteCommentsByIds } from "@/api/commentApi";
import PostForm from "@/components/PostForm";
import CommentsSection from "@/components/CommentsSection";

// How many likes count as "full bar".
const LIKE_GOAL = 10;

export default function PostDetailsScreen() {
  const { id, title: routeTitle } = useLocalSearchParams<{ id: string; title: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [comments, setComments] = useState<CommentObject[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [authorName, setAuthorName] = useState("");

  // Likes are keyed by this name everywhere — the array stores "Anonymous"
  // for signed-out users, so reads must use the same fallback as writes.
  const displayName = authorName || "Anonymous";

  useLayoutEffect(() => {
    navigation.setOptions({ title: post?.title ?? routeTitle ?? "Post Details" });
  }, [navigation, post, routeTitle]);

  useEffect(() => {
    if (id) loadPost();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadAuthor();
    }, [])
  );

  // Who is signed in right now. Empty string when nobody is.
  // Likes and comments are stored under this name.
  async function loadAuthor() {
    const stored = await AsyncStorage.getItem(SESSION_USER);
    setAuthorName(stored ? (JSON.parse(stored) as SessionUser).name : "");
  }

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

  // LIKE — optimistic update: flip likes array in local state immediately,
  // then persist with arrayUnion / arrayRemove in Firestore.
  async function handleToggleLike() {
    if (!post) return;
    const currentLikes = post.likes ?? [];
    const name = displayName;
    const alreadyLiked = currentLikes.includes(name);
    const newLikes = alreadyLiked
      ? currentLikes.filter((n) => n !== name)
      : [...currentLikes, name];
    setPost((prev) => (prev ? { ...prev, likes: newLikes } : prev));
    await toggleLike(post.id, name, alreadyLiked);
  }

  // ADD COMMENT — writes to Firestore, then updates local state immediately.
  async function handleAddComment(text: string) {
    if (!post) return;
    const commentData: CommentData = {
      authorId: displayName,
      comment: text,
    };
    const newId = await addComment(post.id, commentData);
    if (newId) {
      setComments((prev) => [{ id: newId, comment: commentData }, ...prev]);
      setPost((prev) =>
        prev ? { ...prev, comments: [...(prev.comments ?? []), newId] } : prev
      );
    }
  }

  // EDIT COMMENT — only shown when authorId matches the current user.
  async function handleEditComment(commentId: string, text: string) {
    await updateComment(commentId, { comment: text });
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, comment: { ...c.comment, comment: text } } : c
      )
    );
  }

  // DELETE COMMENT — only shown when authorId matches the current user.
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
    // Update local state so the screen reflects the change immediately.
    setPost((prev) => (prev ? { ...prev, ...updated } : prev));
    setEditVisible(false);
  }

  async function confirmAndDelete() {
    await deleteCommentsByIds(post?.comments ?? []);
    await deletePost(id);
    router.back();
  }

// Alert.alert has no UI on web (react-native-web's implementation is a
  // no-op), so the confirm dialog never appears there. window.confirm is
  // the web equivalent.
  function handleDelete() {
    if (Platform.OS === "web") {
      if (window.confirm("This will permanently delete the post. Continue?")) {
        confirmAndDelete();
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
          onPress: confirmAndDelete,
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
  const isLiked = likes.includes(displayName);
  const progress = Math.min(likeCount / LIKE_GOAL, 1);
  const remaining = Math.max(LIKE_GOAL - likeCount, 0);
  const imageUrls = post.imageUrls ?? [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Post content */}
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

        {/* ── Image gallery ────────────────────────────────────────── */}
        {/* These are Firebase Storage download URLs, so they load on every device. */}
        {imageUrls.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
            contentContainerStyle={styles.imageScrollContent}
          >
            {imageUrls.map((url, i) => (
              <Image
                key={i}
                source={{ uri: url }}
                style={styles.detailImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* ── Like section ─────────────────────────────────────────── */}
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

        {/* Who liked */}
        {likeCount > 0 && (
          <Text style={styles.likedBy}>
            Liked by {likes.join(", ")}
          </Text>
        )}

        {/* ── Likes progress bar ───────────────────────────────────── */}
        {/* Bar fills as the post collects likes. Goal: LIKE_GOAL likes. */}
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

        {/* ── Comments ─────────────────────────────────────────────── */}
        <CommentsSection
          comments={comments}
          loading={commentsLoading}
          currentAuthor={displayName}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
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

  // Post
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  author: { fontSize: 14, color: "gray", marginBottom: 14, textDecorationLine: "underline" },
  description: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 16 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    backgroundColor: "#e8f0fe",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  chipText: { color: "#1a73e8", fontSize: 13, fontWeight: "500" },
  error: { fontSize: 16, color: "red" },

  // Image gallery
  imageScroll: { marginBottom: 20 },
  imageScrollContent: { gap: 10 },
  detailImage: { width: 260, height: 200, borderRadius: 12 },

  // Like
  likeSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  likeLabel: { fontSize: 14, color: "#8e8e93", fontWeight: "500" },
  likeLabelActive: { color: "#FF3B30" },
  likeCount: { fontSize: 14, fontWeight: "600", color: "#333" },
  likedBy: {
    fontSize: 12,
    color: "gray",
    marginBottom: 16,
    marginTop: 2,
  },

  // Score
  scoreSection: {
    backgroundColor: "#f2f2f7",
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  scoreLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreLabel: { fontSize: 13, fontWeight: "600", color: "gray", textTransform: "uppercase" },
  scoreValue: { fontSize: 13, fontWeight: "700", color: "#333" },
  progressTrack: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: 8, borderRadius: 4 },
  scoreHint: { fontSize: 12, color: "gray" },

  // Bottom actions
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
