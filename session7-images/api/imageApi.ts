import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebaseConfig";

// UPLOAD — converts a local file URI to a blob, uploads it to Firebase Storage,
// and returns the public download URL that can be saved in Firestore.
//
// uploadId + index give each file a unique path so posts don't overwrite each other.
export async function uploadImage(
  localUri: string,
  uploadId: string,
  index: number
): Promise<string> {
  // fetch() turns a local URI (file:// or content://) into a Blob the browser/JS
  // runtime can hand to the Firebase Storage SDK.
  const response = await fetch(localUri);
  const blob = await response.blob();

  // If the local URI couldn't be read, fetch() can still resolve with an
  // empty blob instead of throwing. Uploading it would silently create a
  // post with a broken image link, so fail loudly here instead.
  if (blob.size === 0) {
    throw new Error("Selected image could not be read (empty file).");
  }

  const path = `posts/${uploadId}/${index}_${Date.now()}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
