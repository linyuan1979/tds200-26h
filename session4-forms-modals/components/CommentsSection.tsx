import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import CommentModal from "@/components/CommentModal";

type Comment = { author: string; text: string };

type CommentsSectionProps = {
  comments: Comment[];
  // Called with the typed text when the user adds a comment.
  onAddComment: (text: string) => void;
};

// Shows the list of comments for a post and lets the user add one.
// It owns the "add comment" popup state so the screen doesn't have to.
export default function CommentsSection({
  comments,
  onAddComment,
}: CommentsSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Comments ({comments.length})</Text>

      {comments.map((comment, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.author}>{comment.author}</Text>
          <Text style={styles.text}>{comment.text}</Text>
        </View>
      ))}

      {comments.length === 0 && (
        <Text style={styles.noComments}>No comments yet.</Text>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addText}>+ Add comment</Text>
      </TouchableOpacity>

      <CommentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={onAddComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "gray",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  item: { backgroundColor: "#f2f2f7", borderRadius: 10, padding: 12, marginBottom: 8 },
  author: { fontSize: 12, fontWeight: "600", color: "#007AFF", marginBottom: 3 },
  text: { fontSize: 14, color: "#333", lineHeight: 20 },
  noComments: { fontSize: 14, color: "gray", marginBottom: 8 },
  addButton: { paddingVertical: 10, marginTop: 4 },
  addText: { fontSize: 15, color: "#007AFF", fontWeight: "500" },
});
