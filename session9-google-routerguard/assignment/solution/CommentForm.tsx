import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";

type CommentFormProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
};

export default function CommentForm({ visible, onClose, onSubmit }: CommentFormProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSaving(true);
    await onSubmit(text.trim());
    setSaving(false);
    setText("");
    onClose();
  }

  function handleClose() {
    setText("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Add Comment</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.submit}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <TextInput
            style={styles.input}
            placeholder="Write your comment…"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            autoFocus
            textAlignVertical="top"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  heading: { fontSize: 17, fontWeight: "600" },
  cancel: { fontSize: 16, color: "#FF3B30" },
  submit: { fontSize: 16, color: "#007AFF", fontWeight: "600" },
  body: { padding: 20 },
  input: {
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
  },
});
