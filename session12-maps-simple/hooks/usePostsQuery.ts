// Custom hooks that wrap React Query's useQuery.
//
// Why useQuery instead of useState + useEffect?
//   useState/useEffect: you write loading, error, and data state yourself every time.
//   useQuery:          loading, error, data, refetch, and caching come for free.
//
// Key concepts:
//   queryKey  — unique identifier for this query's cache entry; must change when inputs change
//   queryFn   — async function that fetches the data; called automatically when the key changes
//   enabled   — set to false to skip the query (e.g. when required params are not yet available)
//   staleTime — how long (ms) data is considered fresh before React Query refetches in the background

import { useQuery } from "@tanstack/react-query";
import { getPostById, getAllPosts } from "@/api/postApi";
import { getMyPosts } from "@/api/queryApi";

// Fetch a single post by ID.
// replaces: const [post, setPost] = useState(null); useEffect(() => { getPostById(id).then(setPost) }, [id])
export function usePostQuery(id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
}

// Fetch all posts — used as a fallback when the real-time subscription is not needed.
export function useAllPostsQuery() {
  return useQuery({
    queryKey: ["posts", "all"],
    queryFn: () => getAllPosts(),
    staleTime: 30_000, // treat data as fresh for 30 seconds before refetching
  });
}

// Remote query: fetch only the signed-in user's posts.
// Requires a userId — query is disabled until one is available.
export function useMyPostsQuery(
  userId: string | undefined,
  sortOrder: "asc" | "desc" = "desc"
) {
  return useQuery({
    queryKey: ["posts", "mine", userId, sortOrder],
    queryFn: () => getMyPosts(userId!, sortOrder),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
