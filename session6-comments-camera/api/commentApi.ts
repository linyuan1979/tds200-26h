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

// CREATE — stores the comment as its own document in "comments",
// then appends its auto-generated id to the post's comments array.
// arrayUnion ensures the id is only added once even if called twice.
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

// READ — fetches each comment document by id.
// Comments are stored individually so they can be deleted independently.
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

// DELETE ONE — removes the comment document and removes its id from the post array.
// arrayRemove removes the id only if it is present (safe to call even if missing).
export async function deleteComment(
  commentId: string,
  postId: string
): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, postId), {
    comments: arrayRemove(commentId),
  });
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
}

// DELETE MANY — removes a batch of comment documents by their ids.
// Used when deleting a post so its comments are cleaned up from the collection.
// No need to update the post's comments array — the post itself is being deleted.
export async function deleteCommentsByIds(commentIds: string[]): Promise<void> {
  for (const commentId of commentIds) {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
  }
}
