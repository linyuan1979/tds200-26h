// app/redirect.tsx
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession(); // must run first

import { useEffect } from "react";
import React from "react";

// Popup-only relay page: just hands the id_token to the opener window, which
// owns the actual signInWithGoogleIdToken call (see auth.tsx's message listener).
// Do not call signInWithGoogleIdToken here too — that would sign in twice.
export default function RedirectHandler() {
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get("id_token");

    if (idToken && window.opener) {
      window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", idToken }, "*");
      window.close();
    } else {
      window.location.replace("/");
    }
  }, []);

  return <div>Completing login...</div>;
}
