// Web implementation of PostMapView using the Google Maps JavaScript API.
// Metro platform resolution: this file is loaded on web;
// PostMapView.native.tsx is loaded on iOS and Android.
//
// Requires "Maps JavaScript API" enabled in Google Cloud Console
// (separate from "Maps SDK for Android/iOS").
// Uses the same EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as the native builds.
import React, { useCallback, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { PostMapViewProps } from "@/utils/mapUtils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 20;

export default function PostMapView({ location, style }: PostMapViewProps) {
  // useJsApiLoader injects the Google Maps JS script into the page once.
  // Subsequent calls with the same id reuse the already-loaded script.
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const zoom = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    const currentZoom = map.getZoom() ?? 15;
    map.setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + delta)));
  };

  const center = { lat: location.latitude, lng: location.longitude };

  // Maps JavaScript API failed to load (wrong key, API not enabled, network error).
  if (loadError) {
    return (
      <View style={[styles.centered, style]}>
        <Text style={styles.errorText}>
          Could not load Google Maps.{"\n"}Make sure Maps JavaScript API is enabled and EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is set.
        </Text>
      </View>
    );
  }

  // Script is still being fetched — show a spinner in the allocated space.
  if (!isLoaded) {
    return (
      <View style={[styles.centered, style]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading map…</Text>
      </View>
    );
  }

  return (
    // GoogleMap uses position:absolute to fill the parent View. This avoids the
    // CSS issue where height:100% is unreliable inside a ScrollView (no definite
    // ancestor height to resolve against) — the parent's own height (set by `style`) wins instead.
    <View style={[styles.container, style]}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <MarkerF position={center} />
      </GoogleMap>
      <TouchableOpacity style={[styles.button, styles.zoomIn]} onPress={() => zoom(1)}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.zoomOut]} onPress={() => zoom(-1)}>
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
    </View>
  );
}

const mapContainerStyle = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

const styles = StyleSheet.create({
  container: {
    height: 180,
    minHeight: 180,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "gray",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
    padding: 24,
    lineHeight: 22,
  },
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
