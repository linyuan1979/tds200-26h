import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React from "react";
import { PostData, NewPostData } from "@/utils/postData";
import ImageSelector from "@/components/ImageSelector";

type PostFormProps = {
  visible: boolean;
  authorName: string;
  initialData?: PostData;
  onClose: () => void;
  onSubmit: (post: NewPostData, localImages: string[]) => void;
};

function parseHashtags(str: string): string[] {
  return str
    .split(" ")
    .filter((t) => t.startsWith("#"))
    .map((t) => t.slice(1));
}

export default function PostForm({
  visible,
  authorName,
  initialData,
  onClose,
  onSubmit,
}: PostFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [titleError, setTitleError] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setChips(parseHashtags(initialData.hashtags));
      } else {
        resetForm();
      }
    }
  }, [visible, initialData?.id]);

  function handleAddChip() {
    const tag = hashtagInput.trim().replace(/^#+/, "");
    if (tag && !chips.includes(tag)) {
      setChips((prev) => [...prev, tag]);
    }
    setHashtagInput("");
  }

  function handleRemoveChip(tag: string) {
    setChips((prev) => prev.filter((t) => t !== tag));
  }

  function handleSubmit() {
    if (!title.trim()) {
      setTitleError("Title is required.");
      return;
    }
    const post: NewPostData = {
      title: title.trim(),
      description: description.trim(),
      hashtags: chips.map((t) => `#${t}`).join(" "),
      author: authorName || "Anonymous",
    };
    onSubmit(post, images);
    resetForm();
    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setHashtagInput("");
    setChips([]);
    setTitleError("");
    setImages([]);
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
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>
            {isEditMode ? "Edit Post" : "New Post"}
          </Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.submitButton}>
              {isEditMode ? "Save" : "Post"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, titleError ? styles.inputError : null]}
            placeholder="What is this post about?"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError("");
            }}
            autoFocus={!isEditMode}
          />
          {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add more details…"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Hashtags</Text>
          <View style={styles.hashtagRow}>
            <TextInput
              style={styles.hashtagInput}
              placeholder="machine learning"
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={handleAddChip}
              autoCapitalize="none"
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addChipButton} onPress={handleAddChip}>
              <Text style={styles.addChipText}>+</Text>
            </TouchableOpacity>
          </View>

          {chips.length > 0 && (
            <View style={styles.chipsContainer}>
              {chips.map((tag) => (
                <View key={tag} style={styles.chip}>
                  <Text style={styles.chipText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveChip(tag)}>
                    <Text style={styles.chipRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.label}>Author</Text>
          <View style={styles.authorRow}>
            <Text style={styles.authorValue}>{authorName || "Anonymous"}</Text>
            {!isEditMode && <Text style={styles.authorHint}>from your account</Text>}
          </View>

          {!isEditMode && (
            <>
              <Text style={styles.label}>Images</Text>
              <ImageSelector images={images} onChange={setImages} />
            </>
          )}
        </ScrollView>
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
  cancelButton: { fontSize: 16, color: "#FF3B30" },
  submitButton: { fontSize: 16, color: "#007AFF", fontWeight: "600" },
  form: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "gray",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: { borderColor: "#FF3B30" },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  errorText: { color: "#FF3B30", fontSize: 13, marginTop: -14, marginBottom: 14 },
  hashtagRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  hashtagInput: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  addChipButton: {
    width: 50, borderRadius: 10, backgroundColor: "#007AFF",
    justifyContent: "center", alignItems: "center",
  },
  addChipText: { color: "white", fontSize: 26, lineHeight: 30 },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#e8f0fe", borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 12, gap: 6,
  },
  chipText: { color: "#1a73e8", fontSize: 14, fontWeight: "500" },
  chipRemove: { color: "#1a73e8", fontSize: 16, fontWeight: "bold" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, marginBottom: 20 },
  authorValue: { fontSize: 16, fontWeight: "600" },
  authorHint: { fontSize: 13, color: "gray" },
});
