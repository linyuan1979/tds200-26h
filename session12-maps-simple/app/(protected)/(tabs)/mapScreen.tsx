import React, { useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";

import { useAllPostsQuery } from "@/hooks/usePostsQuery";
import AllPostsMapView from "@/components/AllPostsMapView";
import { getPostsWithLocation } from "@/utils/mapUtils";

// Map tab: one pin for every post that has a location.
// AllPostsMapView is platform-specific, just like PostMapView:
//   components/AllPostsMapView.native.tsx → react-native-maps (iOS / Android)
//   components/AllPostsMapView.tsx        → Google Maps JavaScript API (web)
export default function MapScreen() {
  // Same React Query hook from Session 11 — loading state and caching for free.
  const { data: posts = [], isLoading, refetch } = useAllPostsQuery();

  // Refetch whenever the tab is opened, so a post you just created shows up.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const locatedCount = getPostsWithLocation(posts).length;

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {locatedCount === 0
            ? 'No posts with locations yet. Create a post and tap "Use my location".'
            : `📍 ${locatedCount} post${locatedCount > 1 ? "s" : ""} on the map`}
        </Text>
      </View>

      <AllPostsMapView posts={posts} style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },
  banner: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  bannerText: { fontSize: 13, color: "#007AFF", fontWeight: "600", textAlign: "center" },
});
