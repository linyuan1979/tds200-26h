export interface PostData {
  id: string;
  title: string;
  description: string;
  hashtags: string;
  author: string;
  likes?: string[];    // array of author names who liked the post
  comments?: string[]; // array of comment document IDs stored in Firestore
  // Local device URIs (file:// or content://) for the pictures on this post.
  // They only work on the phone that took them. Session 7 uploads the files to
  // Firebase Storage and stores permanent download URLs here instead.
  imageUrls?: string[];
  // Set by Firestore's serverTimestamp() when the post is created.
  createdAt?: { seconds: number; nanoseconds: number };
}

// A single comment stored in the "comments" Firestore collection.
export interface CommentData {
  authorId: string;
  comment: string;
}

// What we get back when we fetch a comment by id.
export interface CommentObject {
  id: string;
  comment: CommentData;
}
