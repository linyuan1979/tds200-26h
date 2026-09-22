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
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { PostData } from "@/utils/postData";

const POSTS_COLLECTION = "posts";

// NewPost is PostData without the id, likes, and comments fields.
// Firestore generates the id; likes and comments always start empty.
// imageUrls is optional — a post can be created without pictures.
export type NewPost = {
  title: string;
  description: string;
  hashtags: string;
  author: string;
  imageUrls?: string[];
};

// CREATE
export async function createPost(data: NewPost): Promise<void> {
  await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    likes: [],
    comments: [],
    imageUrls: data.imageUrls ?? [],
    createdAt: serverTimestamp(),
  });
}

// READ ALL — returns every post, newest first by default.
// Pass "asc" to flip the order (the Home tab uses this for its sort button).
export async function getAllPosts(
  sortOrder: "asc" | "desc" = "desc"
): Promise<PostData[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy("createdAt", sortOrder)
  );

  const snapshot = await getDocs(q);
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

  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("author", "==", authorName.trim())
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));

    // Sorted here instead of in the query: combining where() with orderBy()
    // on a different field needs a Firestore composite index, which is extra
    // setup students would have to do in the Firebase console.
    return posts.sort((a, b) => {
      const aTime = a.createdAt?.seconds ?? 0;
      const bTime = b.createdAt?.seconds ?? 0;
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });
  } catch (error) {
    console.error("Failed to fetch the author's posts:", error);
    throw new Error("Could not load the author's posts.");
  }
}

// READ ONE — returns a single post by its Firestore id, or null if not found
export async function getPostById(id: string): Promise<PostData | null> {
  const snap = await getDoc(doc(db, POSTS_COLLECTION, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PostData) : null;
}

// UPDATE — only the fields we pass in are changed.
// Takes any post field except id, not just NewPost — so callers can also
// write likes/comments/imageUrls here instead of a raw updateDoc call.
export async function updatePost(
  id: string,
  data: Partial<Omit<PostData, "id">>
): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, id), data);
}

// DELETE
export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, id));
}

// LIKE / UNLIKE — adds or removes the user's name from the post's likes array
export async function toggleLike(
  id: string,
  authorId: string,
  currentlyLiked: boolean
): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, id), {
    likes: currentlyLiked ? arrayRemove(authorId) : arrayUnion(authorId),
  });
}
