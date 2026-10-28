// Loaded on iOS and Android only.
// Metro picks AllPostsMapView.native.tsx on native, AllPostsMapView.tsx on web.
import React from "react";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";

import { AllPostsMapViewProps, getPostsWithLocation, getRegionForPosts } from "@/utils/mapUtils";

export default function AllPostsMapView({ posts, style }: AllPostsMapViewProps) {
  const router = useRouter();
  const postsWithLocation = getPostsWithLocation(posts);

  // initialRegion is only used when the map first mounts. Changing the key
  // when the list of posts changes remounts the map, so it re-fits all pins.
  const mapKey = postsWithLocation.map((post) => post.id).join(",");

  return (
    <MapView key={mapKey} style={[{ flex: 1 }, style]} initialRegion={getRegionForPosts(posts)}>
      {postsWithLocation.map((post) => (
        // title + description give a built-in callout bubble when the pin is tapped.
        // Tapping the bubble opens the post.
        <Marker
          key={post.id}
          coordinate={post.location!}
          title={post.title}
          description={`By ${post.author} · tap to open`}
          onCalloutPress={() =>
            router.push({
              pathname: "/postDetails/[id]",
              params: { id: post.id, title: post.title },
            })
          }
        />
      ))}
    </MapView>
  );
}
