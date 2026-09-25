import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { CommentData, CommentObject } from "@/utils/postData";

const COMMENTS_COLLECTION = "comments";
const POSTS_COLLECTION = "posts";

export async function addComment(
  postId: string,
  comment: CommentData
): Promise<string | null> {
  const commentRef = await addDoc(collection(db, COMMENTS_COLLECTION), comment);
  await updateDoc(doc(db, POSTS_COLLECTION, postId), {
    comments: arrayUnion(commentRef.id),
  });
  return commentRef.id;
}

export async function getCommentsByIds(ids: string[]): Promise<CommentObject[]> {
  if (!ids || ids.length === 0) return [];
  const results: CommentObject[] = [];
  for (const id of ids) {
    const snap = await getDoc(doc(db, COMMENTS_COLLECTION, id));
    if (snap.exists()) {
      results.push({ id: snap.id, comment: snap.data() as CommentData });
    }
  }
  return results;
}

// UPDATE — edits an existing comment's text. Only the comment document
// changes; the post's comments array (the list of ids) stays the same.
export async function updateComment(
  commentId: string,
  data: Partial<CommentData>
): Promise<void> {
  await updateDoc(doc(db, COMMENTS_COLLECTION, commentId), data);
}

export async function deleteComment(
  commentId: string,
  postId: string
): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, postId), {
    comments: arrayRemove(commentId),
  });
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
}

export async function deleteCommentsByIds(commentIds: string[]): Promise<void> {
  for (const commentId of commentIds) {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
  }
}
