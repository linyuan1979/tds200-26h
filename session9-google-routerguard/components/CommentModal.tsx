import { useEffect, useState } from "react";
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

type CommentModalProps = {
  visible: boolean;
  // Pass the existing text to edit a comment; leave empty to add a new one.
  initialText?: string;
  onClose: () => void;
  // Called with the typed text when the user presses "Add"/"Save". Returns a
  // Promise so the modal can show a spinner until the Firestore write finishes.
  onSubmit: (text: string) => Promise<void>;
};

// A small popup for typing one comment. It owns its own text state and
// clears itself whenever it closes, so the parent only handles the result.
export default function CommentModal({
  visible,
  initialText = "",
  onClose,
  onSubmit,
}: CommentModalProps) {
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const isEditing = initialText.length > 0;

  // Re-fill the box with the comment's current text each time the modal opens.
  useEffect(() => {
    if (visible) setText(initialText);
  }, [visible, initialText]);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSaving(true);
    await onSubmit(trimmed);
    setSaving(false);

    setText("");
    onClose();
  }

  function handleCancel() {
    setText("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.dialog}>
            <Text style={styles.title}>{isEditing ? "Edit comment" : "Add a comment"}</Text>
            <TextInput
              style={styles.input}
              placeholder="Write your comment…"
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              editable={!saving}
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.action, styles.cancel]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.action, styles.add]}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.addText}>{isEditing ? "Save" : "Add"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  input: {
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: { flexDirection: "row", gap: 10 },
  action: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  cancel: { backgroundColor: "#f2f2f7" },
  add: { backgroundColor: "#007AFF" },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#333" },
  addText: { fontSize: 15, fontWeight: "600", color: "white" },
});
