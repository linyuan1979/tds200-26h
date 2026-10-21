// Remote Firestore queries using where() for server-side filtering.
//
// Difference from getAllPosts in postApi.ts:
//   getAllPosts() — returns every post (no filter, full collection scan)
//   getMyPosts()  — returns only posts where authorId == current user (server filters)
//
// Why server-side filtering matters:
//   - Reduces the data transferred over the network
//   - Scales: Firestore only reads the documents that match
//   - Required for large collections where loading everything is too slow or expensive
//
// Note: Firestore composite indexes are sometimes required when combining
// where() with orderBy(). If you see an error about a missing index,
// follow the link in the error message to create it in the Firebase console.

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { PostData } from "@/utils/postData";

const POSTS_COLLECTION = "posts";

// Fetch only posts created by a specific user — demonstrates where() filtering.
//
// No orderBy in the query: combining where() on one field with orderBy() on a
// different field requires a Firestore composite index (created manually in
// the Firebase console). A single equality where() works with Firestore's
// automatic single-field indexes, so we sort the results here instead —
// same method as session9's getAllMyPosts.
export async function getMyPosts(
  userId: string,
  sortOrder: "asc" | "desc" = "desc"
): Promise<PostData[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where("authorId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostData));

  return posts.sort((a: any, b: any) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });
}
