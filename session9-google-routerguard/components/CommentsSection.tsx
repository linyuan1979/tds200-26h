import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { CommentObject } from "@/utils/postData";
import CommentModal from "@/components/CommentModal";

type CommentsSectionProps = {
  comments: CommentObject[];
  loading?: boolean;
  // Firebase UID of the signed-in user. A comment only shows Edit/Delete
  // when it was written by this UID.
  currentUserId?: string;
  onAdd: (text: string) => Promise<void>;
  onEdit: (commentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string) => void;
};

// Shows the list of comments for a post and lets the user add, edit, or
// delete one. It owns the popup state, so the screen only has to say
// what to do with the result.
export default function CommentsSection({
  comments,
  loading,
  currentUserId,
  onAdd,
  onEdit,
  onDelete,
}: CommentsSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);
  // The comment being edited, or null when the modal is adding a new one.
  const [editingComment, setEditingComment] = useState<CommentObject | null>(null);

  function openAddModal() {
    setEditingComment(null);
    setModalVisible(true);
  }

  function openEditModal(comment: CommentObject) {
    setEditingComment(comment);
    setModalVisible(true);
  }

  // One modal, two jobs: with no comment selected it adds; otherwise it edits.
  async function handleModalSubmit(text: string) {
    if (editingComment) {
      await onEdit(editingComment.id, text);
    } else {
      await onAdd(text);
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Comments ({comments.length})</Text>

      {loading ? (
        <ActivityIndicator size="small" style={styles.spinner} />
      ) : comments.length === 0 ? (
        <Text style={styles.noComments}>No comments yet.</Text>
      ) : (
        comments.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemBody}>
              <Text style={styles.author}>{item.comment.authorName}</Text>
              <Text style={styles.text}>{item.comment.comment}</Text>
            </View>
            {item.comment.authorId === currentUserId && (
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDelete(item.id)}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addText}>+ Add comment</Text>
      </TouchableOpacity>

      <CommentModal
        visible={modalVisible}
        initialText={editingComment?.comment.comment ?? ""}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
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
  spinner: { marginBottom: 8 },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemBody: { flex: 1 },
  author: { fontSize: 12, fontWeight: "600", color: "#007AFF", marginBottom: 3 },
  text: { fontSize: 14, color: "#333", lineHeight: 20 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  deleteButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#FF3B30",
    alignSelf: "flex-start",
  },
  deleteButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  noComments: { fontSize: 14, color: "gray", marginBottom: 8 },
  addButton: { paddingVertical: 10, marginTop: 4 },
  addText: { fontSize: 15, color: "#007AFF", fontWeight: "500" },
});
