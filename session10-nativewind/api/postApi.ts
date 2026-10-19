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
  where,
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

// READ ALL — returns every post, newest first by default.
// Pass "asc" to flip the order (the Home tab uses this for its sort button).
export async function getAllPosts(
  sortOrder: "asc" | "desc" = "desc"
): Promise<PostData[]> {
  const snapshot = await getDocs(
    query(collection(db, POSTS_COLLECTION), orderBy("createdAt", sortOrder))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));
}

// READ MINE — returns only the posts written by one author.
// where() filters on the server, so we download less data.
export async function getAllMyPosts(
  authorName: string,
  sortOrder: "asc" | "desc" = "desc"
): Promise<PostData[]> {
  if (!authorName?.trim()) {
    throw new Error("Author name is required.");
  }

  const snapshot = await getDocs(
    query(collection(db, POSTS_COLLECTION), where("author", "==", authorName.trim()))
  );
  const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));

  // Sorted here instead of in the query: combining where() with orderBy()
  // on a different field needs a Firestore composite index, which is extra
  // setup students would have to do in the Firebase console.
  return posts.sort((a: any, b: any) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });
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
  await deleteDoc(doc(db, POSTS_COLLECTION, id));
}

export async function toggleLike(
  id: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, id), {
    likes: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export function subscribeToPosts(
  callback: (posts: PostData[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const posts = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as PostData)
      );
      callback(posts);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}
