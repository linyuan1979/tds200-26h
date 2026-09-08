import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { PostData } from "@/utils/postData";

const POSTS_COLLECTION = "posts";

// NewPost is PostData without the id field.
// Firestore generates the id automatically when we call addDoc.
export type NewPost = {
  title: string;
  description: string;
  hashtags: string;
  author: string;
};

// CREATE
export async function createPost(data: NewPost): Promise<void> {
  await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// READ ALL — returns all posts sorted by newest first
export async function getAllPostsSorted(): Promise<PostData[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));
}

export async function getAllPosts(): Promise<PostData[]> {
 const snapshot = await getDocs(
    collection(db, POSTS_COLLECTION)
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));
}

// READ ONE — returns a single post by its Firestore id, or null if not found
export async function getPostById(id: string): Promise<PostData | null> {
  const snap = await getDoc(doc(db, POSTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PostData;
}

// UPDATE — only the fields you pass are changed; everything else stays the same
export async function updatePost(id: string, data: Partial<NewPost>): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, id), data);
}

// DELETE
export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, id));
}
