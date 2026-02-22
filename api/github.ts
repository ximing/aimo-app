/**
 * GitHub API
 * 用于检查应用更新
 */

import Constants from "expo-constants";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * GitHub Release 信息
 */
export interface GitHubRelease {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  author: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  assets: Array<{
    url: string;
    id: number;
    node_id: string;
    name: string;
    label: string;
    content_type: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    browser_download_url: string;
  }>;
}

/**
 * 获取 GitHub 仓库的最新 Release
 * @param owner 仓库所有者
 * @param repo 仓库名称
 */
export const getLatestRelease = async (
  owner: string,
  repo: string,
): Promise<GitHubRelease> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/releases/latest`, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch release: ${response.status}`);
  }

  return response.json();
};

/**
 * 从 release 中获取 Android APK 下载链接
 * @param release Release 信息
 * @param appVersion 当前应用版本
 */
export const getApkDownloadUrl = (
  release: GitHubRelease,
  appVersion: string,
): string | null => {
  // 查找 .apk 文件
  const apkAsset = release.assets.find((asset) =>
    asset.name.endsWith(".apk"),
  );

  if (apkAsset) {
    return apkAsset.browser_download_url;
  }

  return null;
};

/**
 * 获取当前应用版本
 */
export const getAppVersion = (): string => {
  // Expo 项目使用 expo-constants 获取版本
  return Constants.expoConfig?.version ?? "1.0.0";
};
