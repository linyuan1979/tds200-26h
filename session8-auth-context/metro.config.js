const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable package.json "exports" field resolution so that
// firebase/auth/react-native (and similar sub-paths) resolve correctly.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["react-native", "require", "default"];

module.exports = config;
