import { PostLocation } from "@/utils/postData";

// PostMapView always shows a single pin (the post being viewed) —
// no grouping of multiple posts/locations is needed.
export type PostMapViewProps = {
  location: PostLocation;
  // Smaller = more zoomed in.
  zoomDelta?: number;
  style?: object;
};
