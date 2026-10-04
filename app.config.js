/**
 * Expo 动态配置文件
 * 自动从 package.json 读取版本号，确保一致性
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require("./package.json");

// Same formula as the server: major * 10000 + minor * 100 + patch.
function versionCodeFromName(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(version).trim());
  if (!match) return 1;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (minor > 99 || patch > 99) return 1;
  const code = major * 10000 + minor * 100 + patch;
  return code > 0 ? code : 1;
}

const versionName = process.env.APP_VERSION_NAME || packageJson.version;
const versionCode = Number(process.env.APP_VERSION_CODE || versionCodeFromName(versionName));

module.exports = {
  expo: {
    name: "aimo",
    slug: "aimo-app",
    version: versionName,
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
      versionCode,
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
      "./plugins/with-huawei-push",
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
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/a9dd2767-f4a6-4412-9543-9e8a0d1595ae",
    },
  },
};
