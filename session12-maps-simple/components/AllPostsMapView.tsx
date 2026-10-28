// Web implementation of AllPostsMapView using the Google Maps JavaScript API.
// Metro platform resolution: this file is loaded on web;
// AllPostsMapView.native.tsx is loaded on iOS and Android.
import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { useRouter } from "expo-router";

import { AllPostsMapViewProps, getPostsWithLocation, getRegionForPosts } from "@/utils/mapUtils";

export default function AllPostsMapView({ posts, style }: AllPostsMapViewProps) {
  const router = useRouter();

  // Same loader id as PostMapView, so the Google Maps script is only loaded once.
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  // Store the id of the tapped post, not the post itself, and look it up below.
  // The marker's onClick may keep an old closure, so an id never goes stale.
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const postsWithLocation = getPostsWithLocation(posts);
  const activePost = postsWithLocation.find((post) => post.id === activePostId);

  // Fit the map around every pin once it has loaded.
  const fitAllPins = (map: google.maps.Map) => {
    if (postsWithLocation.length === 0) return;
    if (postsWithLocation.length === 1) {
      // fitBounds on a single point zooms in all the way, so centre on it instead.
      const { latitude, longitude } = postsWithLocation[0].location!;
      map.setCenter({ lat: latitude, lng: longitude });
      map.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    postsWithLocation.forEach((post) =>
      bounds.extend({ lat: post.location!.latitude, lng: post.location!.longitude })
    );
    map.fitBounds(bounds);
  };

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

  if (!isLoaded) {
    return (
      <View style={[styles.centered, style]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading map…</Text>
      </View>
    );
  }

  const region = getRegionForPosts(posts);

  return (
    // GoogleMap uses position:absolute to fill this View (see PostMapView.tsx).
    <View style={[styles.container, style]}>
      <GoogleMap
        // Remount when the list of posts changes, so onLoad re-fits all pins.
        key={postsWithLocation.map((post) => post.id).join(",")}
        mapContainerStyle={mapContainerStyle}
        center={{ lat: region.latitude, lng: region.longitude }}
        zoom={12}
        onLoad={fitAllPins}
      >
        {postsWithLocation.map((post) => (
          <MarkerF
            key={post.id}
            position={{ lat: post.location!.latitude, lng: post.location!.longitude }}
            onClick={() => setActivePostId(post.id)}
          />
        ))}

        {/* Small popup above the tapped pin */}
        {activePost && (
          <InfoWindowF
            position={{ lat: activePost.location!.latitude, lng: activePost.location!.longitude }}
            onCloseClick={() => setActivePostId(null)}
          >
            <div style={iw.container}>
              <p style={iw.title}>{activePost.title}</p>
              <p style={iw.author}>By {activePost.author}</p>
              <button
                style={iw.openButton}
                onClick={() =>
                  router.push({
                    pathname: "/postDetails/[id]",
                    params: { id: activePost.id, title: activePost.title },
                  })
                }
              >
                Open post →
              </button>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </View>
  );
}

const mapContainerStyle = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

// InfoWindow content is plain HTML, so these are CSS objects, not StyleSheet styles.
const iw = {
  container: { maxWidth: 220, fontFamily: "system-ui, sans-serif", padding: 4 } as const,
  title: { margin: "0 0 2px 0", fontWeight: 700, fontSize: 14, color: "#1a1a1a" } as const,
  author: { margin: "0 0 4px 0", fontSize: 12, color: "#666" } as const,
  openButton: { background: "none", border: "none", color: "#007AFF", fontSize: 12, cursor: "pointer", padding: 0 } as const,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
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
});
