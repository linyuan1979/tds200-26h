import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";

type CommentModalProps = {
  visible: boolean;
  onClose: () => void;
  // Called with the typed text when the user presses "Add".
  onAdd: (text: string) => void;
};

// A small popup for typing one comment. It owns its own text state and
// clears itself whenever it closes, so the parent only handles the result.
export default function CommentModal({ visible, onClose, onAdd }: CommentModalProps) {
  const [text, setText] = useState("");

  function handleAdd() {
    const trimmed = text.trim();
    if (trimmed) {
      onAdd(trimmed);
    }
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
            <Text style={styles.title}>Add a comment</Text>
            <TextInput
              style={styles.input}
              placeholder="Write your comment…"
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.action, styles.cancel]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.action, styles.add]}
                onPress={handleAdd}
              >
                <Text style={styles.addText}>Add</Text>
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
