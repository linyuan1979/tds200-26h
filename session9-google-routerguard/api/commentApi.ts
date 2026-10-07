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
import { db, auth } from "@/firebaseConfig";
import { CommentData, CommentObject } from "@/utils/postData";

const COMMENTS_COLLECTION = "comments";
const POSTS_COLLECTION = "posts";

export async function addComment(
  postId: string,
  text: string
): Promise<{ id: string; comment: CommentData } | null> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to comment.");

  // authorId is always the real UID — never trusts data from the caller
  const comment: CommentData = {
    authorId: user.uid,
    authorName: user.displayName ?? user.email ?? "Anonymous",
    comment: text,
  };

  const commentRef = await addDoc(collection(db, COMMENTS_COLLECTION), comment);
  await updateDoc(doc(db, POSTS_COLLECTION, postId), {
    comments: arrayUnion(commentRef.id),
  });
  return { id: commentRef.id, comment };
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

export async function updateComment(
  commentId: string,
  text: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to edit a comment.");
  const snap = await getDoc(doc(db, COMMENTS_COLLECTION, commentId));
  if (!snap.exists()) throw new Error("Comment not found.");
  const comment = snap.data() as CommentData;
  if (comment.authorId !== user.uid) throw new Error("You can only edit your own comments.");
  await updateDoc(doc(db, COMMENTS_COLLECTION, commentId), { comment: text });
}

export async function deleteComment(
  commentId: string,
  postId: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to delete a comment.");
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
