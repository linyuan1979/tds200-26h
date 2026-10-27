import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebaseConfig";

// UPLOAD — converts a local file URI to a blob, uploads it to Firebase Storage,
// and returns the public download URL that can be saved in Firestore.
export async function uploadImage(
  localUri: string,
  userId: string,
  uploadId: string,
  index: number
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  // Path includes userId so Storage rules can verify ownership:
  // match /posts/{userId}/{allPaths=**} { allow write: if request.auth.uid == userId; }
  const path = `posts/${userId}/${uploadId}/${index}_${Date.now()}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
