import { useState, useRef } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Button,
  Modal,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Device from "expo-device";
import React from "react";

type ImageSelectorProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export default function ImageSelector({ images, onChange }: ImageSelectorProps) {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");

  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const isSimulator =
    (Platform.OS === "ios" && !Device.isDevice) ||
    (Platform.OS === "android" && !Device.isDevice);

  function openCamera() {
    setCameraVisible(true);
  }

  function closeCamera() {
    setCameraVisible(false);
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
            <Text style={styles.simText}>Camera unavailable on simulator</Text>
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
        <TouchableOpacity style={styles.pickerButton} onPress={openCamera}>
          <Text style={styles.pickerText}>📷 Camera</Text>
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {images.map((uri, index) => (
            <View
              key={`img-${index}-${uri.slice(-20)}`}
              style={styles.thumbContainer}
            >
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />

              <View style={styles.actionBar}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.removeBtn]}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.actionText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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