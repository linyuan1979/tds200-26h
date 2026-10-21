import { Timestamp } from "firebase/firestore";

// GPS coordinates attached to a post — both fields required if location is present.
// address is resolved once at creation time via reverse geocoding.
export interface PostLocation {
  latitude: number;
  longitude: number;
  address?: string; // human-readable, e.g. "Karl Johans gate 22, Oslo, Norway"
}

// Shape submitted from PostForm — no id (Firestore assigns it) and no authorId
// (the server sets it from the authenticated user, never from client input).
export interface NewPostData {
  title: string;
  description: string;
  hashtags: string;
  author: string;     // display name shown in the UI
  likes?: string[];
  comments?: string[];
  imageUrls?: string[];
  location?: PostLocation; // optional — posts without location still load and display normally
}

export interface PostData extends NewPostData {
  id: string;
  authorId: string;   // Firebase UID — used for ownership checks and Firestore security rules
  createdAt?: Timestamp; // set by the server via serverTimestamp() — used for "Newest" sorting
}

export interface CommentData {
  authorId: string;   // Firebase UID — used for ownership checks and Firestore security rules
  authorName: string; // display name shown in the UI
  comment: string;
}

export interface CommentObject {
  id: string;
  comment: CommentData;
}
