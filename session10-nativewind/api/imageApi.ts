import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebaseConfig";

// UPLOAD — converts a local file URI to a blob, uploads it to Firebase Storage,
// and returns the public download URL that can be saved in Firestore.
export async function uploadImage(
  localUri: string,
  uploadId: string,
  index: number
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const path = `posts/${uploadId}/${index}_${Date.now()}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
