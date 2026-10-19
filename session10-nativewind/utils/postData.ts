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
}

export interface PostData extends NewPostData {
  id: string;
  authorId: string;   // Firebase UID — used for ownership checks and Firestore security rules
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
