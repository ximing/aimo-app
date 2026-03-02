/**
 * 更新检测 API
 * 从构建时注入的 latest.json 获取最新版本信息
 */

import Constants from "expo-constants";

export interface LatestReleaseManifest {
  version: string;
  buildNumber?: string;
  releaseDate?: number;
  path?: string;
  downloadUrl?: string;
  body?: string;
}

interface ExpoExtraConfig {
  update?: {
    latestJsonUrl?: string;
  };
}

/**
 * 获取构建时注入的 latest.json 地址
 */
export const getLatestJsonUrl = (): string | null => {
  const latestJsonUrl = (Constants.expoConfig?.extra as ExpoExtraConfig | undefined)?.update
    ?.latestJsonUrl;

  if (typeof latestJsonUrl !== "string") {
    return null;
  }

  const normalizedUrl = latestJsonUrl.trim();
  return normalizedUrl.length > 0 ? normalizedUrl : null;
};

/**
 * 获取 latest.json 内容
 */
export const getLatestRelease = async (
  latestJsonUrl: string,
): Promise<LatestReleaseManifest> => {
  const response = await fetch(latestJsonUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch latest.json: ${response.status}`);
  }

  const payload = (await response.json()) as Partial<LatestReleaseManifest>;

  if (typeof payload.version !== "string" || !payload.version.trim()) {
    throw new Error("Invalid latest.json: missing version");
  }

  return {
    version: payload.version.trim(),
    buildNumber:
      typeof payload.buildNumber === "string" ? payload.buildNumber : undefined,
    releaseDate:
      typeof payload.releaseDate === "number" ? payload.releaseDate : undefined,
    path: typeof payload.path === "string" ? payload.path : undefined,
    downloadUrl:
      typeof payload.downloadUrl === "string" ? payload.downloadUrl : undefined,
    body: typeof payload.body === "string" ? payload.body : undefined,
  };
};

/**
 * 从 latest.json 中获取 APK 下载链接
 */
export const getApkDownloadUrl = (release: LatestReleaseManifest): string | null => {
  if (typeof release.downloadUrl === "string" && release.downloadUrl.trim()) {
    return release.downloadUrl;
  }

  return null;
};

/**
 * 获取当前应用版本
 */
export const getAppVersion = (): string => {
  return Constants.expoConfig?.version ?? "1.0.0";
};
