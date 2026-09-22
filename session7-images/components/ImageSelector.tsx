import { useState, useRef } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Button,
  Modal,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMediaLibraryPermissions } from "expo-image-picker";
import * as Device from "expo-device";
import React from "react";

type ImageSelectorProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export default function ImageSelector({ images, onChange }: ImageSelectorProps) {
  const [processing, setProcessing] = useState<number | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = useMediaLibraryPermissions();

  const isSimulator =
    (Platform.OS === "ios" && !Device.isDevice) ||
    (Platform.OS === "android" && !Device.isDevice);

  function openCamera() {
    setCameraVisible(true);
  }

  function closeCamera() {
    setCameraVisible(false);
  }

  // New features to pick up images
  async function pickFromGallery() {
    if (!mediaLibraryPermission?.granted) {
      const result = await requestMediaLibraryPermission();

    if (!result.granted) {
      return;
    }
  }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      onChange([...images, ...result.assets.map((a) => a.uri)]);
    }
  }

  async function captureImage() {
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.85,
    });

    if (photo?.uri) {
      onChange([...images, photo.uri]);
      closeCamera();
    }
  }

  // New features to rotate and crop images
  async function rotateImage(index: number) {
    setProcessing(index);

    try {
      const result = await ImageManipulator.manipulateAsync(
        images[index],
        [{ rotate: 90 }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      const updated = [...images];
      updated[index] = result.uri;
      onChange(updated);
    } finally {
      setProcessing(null);
    }
  }

  async function cropToSquare(index: number) {
    setProcessing(index);

    try {
      const info = await ImageManipulator.manipulateAsync(images[index], []);

      const { width, height } = info;
      const size = Math.min(width, height);

      const result = await ImageManipulator.manipulateAsync(
        images[index],
        [
          {
            crop: {
              originX: (width - size) / 2,
              originY: (height - size) / 2,
              width: size,
              height: size,
            },
          },
        ],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      const updated = [...images];
      updated[index] = result.uri;
      onChange(updated);
    } finally {
      setProcessing(null);
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function renderCameraContent() {
    if (!permission && !isSimulator) {
      return <View style={styles.cameraContainer} />;
    }

    if (!isSimulator && permission && !permission.granted) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={styles.permissionText}>
            We need your permission to show the camera
          </Text>

          <Button onPress={requestPermission} title="Grant permission" />

          <TouchableOpacity style={styles.closeBtn} onPress={closeCamera}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        {!isSimulator ? (
          <CameraView
            ref={(r) => {
              cameraRef.current = r;
            }}
            style={StyleSheet.absoluteFill}
            facing={facing}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.simPanel]}>
            <Text style={styles.simText}>Simulator — use Gallery instead</Text>
          </View>
        )}

        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.cameraBtn} onPress={closeCamera}>
            <Text style={styles.cameraBtnText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shutter, isSimulator && styles.buttonDisabled]}
            disabled={isSimulator}
            onPress={captureImage}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraBtn, isSimulator && styles.buttonDisabled]}
            disabled={isSimulator}
            onPress={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
          >
            <Text style={styles.cameraBtnText}>⟳</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.pickerRow}>
        <TouchableOpacity style={styles.pickerButton} onPress={pickFromGallery}>
          <Text style={styles.pickerText}>🖼 Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pickerButton} onPress={openCamera}>
          <Text style={styles.pickerText}>📷 Camera</Text>
        </TouchableOpacity>
      </View>
{/*     allow multiple images selection */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {images.map((uri, index) => {
            const busy = processing === index;

            return (
              <View
                key={`img-${index}-${uri.slice(-20)}`}
                style={styles.thumbContainer}
              >
                <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />

                {busy && (
                  <View style={styles.busyOverlay}>
                    <ActivityIndicator color="white" />
                  </View>
                )}

                <View style={styles.actionBar}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => rotateImage(index)}
                    disabled={busy}
                  >
                    <Text style={styles.actionText}>↻</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => cropToSquare(index)}
                    disabled={busy}
                  >
                    <Text style={styles.actionText}>✂</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.removeBtn]}
                    onPress={() => removeImage(index)}
                    disabled={busy}
                  >
                    <Text style={styles.actionText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={cameraVisible} animationType="slide">
        {renderCameraContent()}
      </Modal>
    </View>
  );
}

const THUMB = 120;

const styles = StyleSheet.create({
  pickerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  listContent: {
    paddingVertical: 4,
  },
  thumbContainer: {
    width: THUMB,
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  thumb: {
    width: THUMB,
    height: THUMB,
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    height: THUMB,
  },
  actionBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 5,
    alignItems: "center",
  },
  removeBtn: {
    backgroundColor: "rgba(255,59,48,0.7)",
  },
  actionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },
  permissionText: {
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },
  closeBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#aaa",
    fontSize: 16,
  },
  simPanel: {
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  simText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  cameraBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBtnText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});