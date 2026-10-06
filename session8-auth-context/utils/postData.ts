// Shape submitted from PostForm — no id, since Firestore assigns it.
export interface NewPostData {
  title: string;
  description: string;
  hashtags: string;
  author: string;
  likes?: string[];
  comments?: string[];
  imageUrls?: string[]; // Firebase Storage download URLs, set after upload
}

export interface PostData extends NewPostData {
  id: string;
}

export interface CommentData {
  authorId: string;
  comment: string;
}

export interface CommentObject {
  id: string;
  comment: CommentData;
}
