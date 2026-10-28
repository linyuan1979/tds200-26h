// app.config.js is the dynamic version of app.json — it can read process.env
// at build time. We need that to inject EXPO_PUBLIC_GOOGLE_MAPS_API_KEY into
// the Android native config. Expo reads this file automatically if it exists.
//
// app.json      → static, no env vars
// app.config.js → dynamic, can read process.env

// Google Sign-In on iOS redirects back to the app through a URL scheme made
// from the iOS client ID with its parts reversed:
//   "123-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123-abc"
// Reading it from .env means you only change the client ID in one place.
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleIosUrlScheme = googleIosClientId
  ? googleIosClientId.split(".").reverse().join(".")
  : undefined;

module.exports = {
  expo: {
    name: "TDS200 Session 12 (Maps Simple)",
    slug: "tds200-session12-maps-simple",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "tds200session12simple",
    userInterfaceStyle: "light",
    ios: {
      bundleIdentifier: "com.tds200.session12simple",
      supportsTablet: true,
      // Camera, photo and location permission texts come from the plugins below.
      infoPlist: googleIosUrlScheme
        ? { CFBundleURLTypes: [{ CFBundleURLSchemes: [googleIosUrlScheme] }] }
        : {},
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_MEDIA_IMAGES",
        // Location permissions are added by the expo-location plugin below.
      ],
      package: "com.tds200.session12simple",
      // Google Maps API key for Android — read from .env at build time
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      // The app only takes photos, so skip the microphone permission.
      ["expo-camera", { microphonePermission: false, recordAudioAndroid: false }],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to access your photos to attach to posts.",
          cameraPermission:
            "Allow $(PRODUCT_NAME) to take photos to attach to posts.",
          microphonePermission: false,
        },
      ],
      // Sets the iOS location permission text and adds the Android
      // ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION permissions.
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to access your location to attach it to posts.",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
