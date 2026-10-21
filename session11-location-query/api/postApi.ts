import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { PostData, NewPostData } from "@/utils/postData";

const POSTS_COLLECTION = "posts";

export async function createPost(data: NewPostData): Promise<void> {
  const user = auth.currentUser;
  // Client-side guard — Firestore rules enforce this on the server too.
  if (!user) throw new Error("You must be signed in to create a post.");

  await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    authorId: user.uid, // always set from the real Firebase user, never from client input
    comments: [],
    likes: [],
    imageUrls: data.imageUrls ?? [],
    createdAt: serverTimestamp(),
  });
}

export async function getAllPosts(
  sortOrder: "asc" | "desc" = "desc"
): Promise<PostData[]> {
  const snapshot = await getDocs(
    query(collection(db, POSTS_COLLECTION), orderBy("createdAt", sortOrder))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));
}

export async function getPostById(id: string): Promise<PostData | null> {
  const snap = await getDoc(doc(db, POSTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PostData;
}

export async function updatePost(
  id: string,
  data: Partial<NewPostData>
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to edit a post.");
  await updateDoc(doc(db, POSTS_COLLECTION, id), data);
}

export async function deletePost(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to delete a post.");
  const post = await getPostById(id);
  if (!post) throw new Error("Post not found.");
  if (post.authorId !== user.uid) throw new Error("You can only delete your own posts.");
  await deleteDoc(doc(db, POSTS_COLLECTION, id));
}

export async function toggleLike(
  id: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to like a post.");
  await updateDoc(doc(db, POSTS_COLLECTION, id), {
    likes: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}
