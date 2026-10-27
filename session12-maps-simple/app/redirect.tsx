// app/redirect.tsx
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession(); // must run first

import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { signInWithGoogleIdToken } from "../api/authApi";

export default function RedirectHandler() {
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get("id_token");

    if (idToken) {
      signInWithGoogleIdToken(idToken)
        .then(() => {
          Toast.show({ type: "success", text1: "Google login success" });
          if (window.opener) {
            window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", idToken }, "*");
            window.close();
          } else {
            window.location.replace("/");
          }
        })
        .catch((err: any) => {
          Toast.show({ type: "error", text1: "Login failed", text2: err.message });
        });
    }
  }, []);

  return <div>Completing login...</div>;
}
