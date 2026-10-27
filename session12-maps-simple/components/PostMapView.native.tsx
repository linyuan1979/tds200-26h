// Loaded on iOS and Android only.
// Metro picks PostMapView.native.tsx on native, PostMapView.tsx on web.
import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { PostMapViewProps } from "@/utils/mapUtils";

// Smaller delta = more zoomed in. Each button press halves/doubles the delta.
const MIN_DELTA = 0.002;
const MAX_DELTA = 40;

export default function PostMapView({ location, zoomDelta = 0.01, style }: PostMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [delta, setDelta] = useState(zoomDelta);

  const zoom = (factor: number) => {
    const nextDelta = Math.min(MAX_DELTA, Math.max(MIN_DELTA, delta * factor));
    setDelta(nextDelta);
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: nextDelta,
        longitudeDelta: nextDelta,
      },
      200
    );
  };

  const region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region}>
        <Marker coordinate={location} />
      </MapView>
      <TouchableOpacity style={[styles.button, styles.zoomIn]} onPress={() => zoom(0.5)}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.zoomOut]} onPress={() => zoom(2)}>
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  button: {
    position: "absolute",
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  zoomIn: { top: 8 },
  zoomOut: { top: 44 },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});
