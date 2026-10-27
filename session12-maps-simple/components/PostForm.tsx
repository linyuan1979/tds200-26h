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
  ActivityIndicator,
} from "react-native";
import React from "react";
import { PostData, NewPostData, PostLocation } from "@/utils/postData";
import ImageSelector from "@/components/ImageSelector";
import { getCurrentLocation, getMockLocation } from "@/utils/locationUtils";

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
  const [location, setLocation] = useState<PostLocation | undefined>(undefined);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showMockInput, setShowMockInput] = useState(false);
  const [mockLat, setMockLat] = useState("");
  const [mockLng, setMockLng] = useState("");

  const isEditMode = !!initialData;

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setChips(parseHashtags(initialData.hashtags));
        setLocation(initialData.location);
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

  async function handleUseCurrentLocation() {
    setLocationError("");
    setLocationLoading(true);
    try {
      const result = await getCurrentLocation();
      setLocation(result);
    } catch (e: any) {
      setLocationError(e.message ?? "Could not get your location.");
    } finally {
      setLocationLoading(false);
    }
  }

  // No permission, GPS, or network needed — handy for testing on a
  // simulator/emulator that doesn't have a location fix set up.
  async function handleSubmitMockLocation() {
    setLocationError("");
    setLocationLoading(true);
    try {
      const result = await getMockLocation(parseFloat(mockLat), parseFloat(mockLng));
      setLocation(result);
      setShowMockInput(false);
      setMockLat("");
      setMockLng("");
    } catch (e: any) {
      setLocationError(e.message ?? "Could not use those coordinates.");
    } finally {
      setLocationLoading(false);
    }
  }

  function handleCancelMockInput() {
    setShowMockInput(false);
    setMockLat("");
    setMockLng("");
    setLocationError("");
  }

  function handleRemoveLocation() {
    setLocation(undefined);
    setLocationError("");
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
      ...(location ? { location } : {}),
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
    setLocation(undefined);
    setLocationError("");
    setShowMockInput(false);
    setMockLat("");
    setMockLng("");
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

          {!isEditMode && (
            <>
              <Text style={styles.label}>Location</Text>
              {location ? (
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>📍 {location.address}</Text>
                  <TouchableOpacity onPress={handleRemoveLocation}>
                    <Text style={styles.locationRemove}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : showMockInput ? (
                <View style={styles.mockInputContainer}>
                  <View style={styles.mockInputRow}>
                    <TextInput
                      style={[styles.input, styles.mockInputHalf]}
                      placeholder="Latitude (-90 to 90)"
                      value={mockLat}
                      onChangeText={setMockLat}
                      keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                    />
                    <TextInput
                      style={[styles.input, styles.mockInputHalf]}
                      placeholder="Longitude (-180 to 180)"
                      value={mockLng}
                      onChangeText={setMockLng}
                      keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                    />
                  </View>
                  <View style={styles.locationButtonRow}>
                    <TouchableOpacity
                      style={[styles.locationButton, styles.locationButtonHalf]}
                      onPress={handleCancelMockInput}
                      disabled={locationLoading}
                    >
                      <Text style={styles.locationButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.locationButton, styles.locationButtonHalf]}
                      onPress={handleSubmitMockLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : (
                        <Text style={styles.locationButtonText}>Set location</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.locationButtonRow}>
                  <TouchableOpacity
                    style={[styles.locationButton, styles.locationButtonHalf]}
                    onPress={handleUseCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <Text style={styles.locationButtonText}>📍 Use my location</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.locationButton, styles.locationButtonHalf]}
                    onPress={() => setShowMockInput(true)}
                    disabled={locationLoading}
                  >
                    <Text style={styles.locationButtonText}>🧪 Enter coordinates</Text>
                  </TouchableOpacity>
                </View>
              )}
              {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
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
  locationButtonRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  locationButton: {
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  locationButtonHalf: { flex: 1 },
  locationButtonText: { fontSize: 14, color: "#007AFF", fontWeight: "600" },
  mockInputContainer: { marginBottom: 20 },
  mockInputRow: { flexDirection: "row", gap: 10 },
  mockInputHalf: { flex: 1, marginBottom: 10 },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e8f0fe",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  locationLabel: { fontSize: 14, color: "#1a73e8", fontWeight: "500", flex: 1 },
  locationRemove: { fontSize: 13, color: "#FF3B30", fontWeight: "600" },
});
