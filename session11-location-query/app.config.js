// app.config.js is the dynamic version of app.json — it can read process.env
// at build time. Expo reads this file automatically if it exists.
//
// app.json      → static, no env vars
// app.config.js → dynamic, can read process.env

module.exports = {
  expo: {
    name: "TDS200 Session 11",
    slug: "tds200-session11",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "tds200session11",
    userInterfaceStyle: "light",
    ios: {
      bundleIdentifier: "com.tds200.session11",
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "Select photos to attach to your posts.",
        NSCameraUsageDescription: "Take photos to attach to your posts.",
        // Location permission text comes from the expo-location plugin below.
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              "com.googleusercontent.apps.703706990742-d3gop1m22amtmpqdek9m24qhftq5cfuk",
            ],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.RECORD_AUDIO",
        // Location permissions are added by the expo-location plugin below.
      ],
      package: "com.tds200.session11",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-camera",
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to access your photos to attach to posts.",
          cameraPermission:
            "Allow $(PRODUCT_NAME) to take photos to attach to posts.",
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
