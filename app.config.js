/**
 * Expo 动态配置文件
 * 自动从 package.json 读取版本号，确保一致性
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require("./package.json");

const latestJsonUrl = process.env.EXPO_PUBLIC_LATEST_JSON_URL || process.env.LATEST_JSON_URL || "";

module.exports = {
  expo: {
    name: "aimo",
    slug: "aimo-app",
    version: packageJson.version,
    orientation: "portrait",
    icon: "./assets/logo.png",
    scheme: "aimoapp",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.delu.aimo",
      supportsTablet: true,
    },
    android: {
      package: "com.delu.aimo",
      adaptiveIcon: {
        backgroundColor: "#FFFFFF",
        foregroundImage: "./assets/logo.png",
        monochromeImage: "./assets/logo-dark.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
            image: "./assets/logo-dark.png",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "a9dd2767-f4a6-4412-9543-9e8a0d1595ae",
      },
      update: {
        latestJsonUrl,
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/a9dd2767-f4a6-4412-9543-9e8a0d1595ae",
    },
  },
};
