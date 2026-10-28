import { PostData, PostLocation } from "@/utils/postData";

// PostMapView always shows a single pin (the post being viewed) —
// no grouping of multiple posts/locations is needed.
export type PostMapViewProps = {
  location: PostLocation;
  // Smaller = more zoomed in.
  zoomDelta?: number;
  style?: object;
};

// AllPostsMapView shows one pin per post that has a location (Map tab).
export type AllPostsMapViewProps = {
  posts: PostData[];
  style?: object;
};

// Shown when there are no located posts yet.
const DEFAULT_REGION = {
  latitude: 59.9139, // Oslo
  longitude: 10.7522,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Keep only posts that have GPS coordinates.
export function getPostsWithLocation(posts: PostData[]): PostData[] {
  return posts.filter((post) => post.location);
}

// Work out a map region that fits every located post on screen:
// the centre is the middle of all pins, and the delta is how far apart they are.
export function getRegionForPosts(posts: PostData[]) {
  const locations = getPostsWithLocation(posts).map((post) => post.location!);
  if (locations.length === 0) return DEFAULT_REGION;

  const latitudes = locations.map((l) => l.latitude);
  const longitudes = locations.map((l) => l.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    // * 1.5 adds some padding around the outer pins.
    // Math.max keeps a single pin (span 0) from zooming in too far.
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.02),
  };
}
