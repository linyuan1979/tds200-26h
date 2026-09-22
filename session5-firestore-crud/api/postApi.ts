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

  export async function getAllPosts(
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PostData[]> {
    const collectionRef = collection(db, POSTS_COLLECTION);
    const q = query(
      collectionRef,
      orderBy("createdAt", sortOrder)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));
  }
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
      where("author", "==", authorName.trim()),
      orderBy("createdAt", sortOrder)
    );

    const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));
  } catch (error) {
    console.error("Failed to fetch the author's posts:", error);
    throw new Error("Could not load the author's posts.");
  }
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
