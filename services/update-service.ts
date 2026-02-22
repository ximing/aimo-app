/**
 * 版本检查服务
 *
 * 功能：
 * - 检查 GitHub 最新 Release
 * - 比较版本号判断是否需要升级
 * - 提供 APK 下载和安装功能
 */

import { Service } from "@rabjs/react";
import * as Linking from "expo-linking";
import { File, Directory, Paths } from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";
import {
  getLatestRelease,
  getApkDownloadUrl,
  getAppVersion,
  type GitHubRelease,
} from "@/api/github";
import { needsUpdate, formatVersion } from "@/utils/version";

// GitHub 仓库配置
const GITHUB_OWNER = "ximing";
const GITHUB_REPO = "aimo-app";

class UpdateService extends Service {
  /**
   * 当前检查状态
   */
  loading = false;

  /**
   * 最新 Release 信息
   */
  latestRelease: GitHubRelease | null = null;

  /**
   * 错误信息
   */
  error: string | null = null;

  /**
   * APK 下载进度 (0-100)
   */
  downloadProgress = 0;

  /**
   * 是否正在下载
   */
  downloading = false;

  /**
   * 下载的 APK 本地路径
   */
  downloadedApkPath: string | null = null;

  /**
   * 获取当前应用版本
   */
  get currentVersion(): string {
    return getAppVersion();
  }

  /**
   * 获取最新版本号
   */
  get latestVersion(): string | null {
    return this.latestRelease?.tag_name ?? null;
  }

  /**
   * 检查是否有可用更新
   */
  get hasUpdate(): boolean {
    if (!this.latestRelease) return false;
    return needsUpdate(this.currentVersion, this.latestRelease.tag_name);
  }

  /**
   * 检查更新
   */
  async checkForUpdate(): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const release = await getLatestRelease(GITHUB_OWNER, GITHUB_REPO);
      this.latestRelease = release;
      this.loading = false;
      return this.hasUpdate;
    } catch (err) {
      this.loading = false;
      this.error = err instanceof Error ? err.message : "检查更新失败";
      console.error("Failed to check for update:", err);
      return false;
    }
  }

  /**
   * 获取 APK 下载链接
   */
  getApkUrl(): string | null {
    if (!this.latestRelease) return null;
    return getApkDownloadUrl(this.latestRelease, this.currentVersion);
  }

  /**
   * 下载并安装 APK
   * 仅支持 Android 平台
   */
  async downloadAndInstallApk(): Promise<void> {
    if (Platform.OS !== "android") {
      this.error = "仅支持 Android 平台下载安装";
      return;
    }

    const apkUrl = this.getApkUrl();
    if (!apkUrl) {
      this.error = "未找到 APK 下载链接";
      return;
    }

    this.downloading = true;
    this.downloadProgress = 0;
    this.error = null;

    try {
      // 使用 expo-file-system 的 downloadFileAsync 方法下载 APK
      const cacheDir = Paths.cache;
      const apkFile = new File(cacheDir, "aimo-app-latest.apk");

      // 下载 APK
      const downloadedFile = await File.downloadFileAsync(apkUrl, apkFile);

      this.downloadedApkPath = downloadedFile.uri;
      this.downloading = false;
      this.downloadProgress = 100;

      // 安装 APK
      await this.installApk(downloadedFile.uri);
    } catch (err) {
      this.downloading = false;
      this.downloadProgress = 0;
      this.error = err instanceof Error ? err.message : "下载失败";
      console.error("Failed to download APK:", err);
    }
  }

  /**
   * 安装 APK
   * 使用 expo-intent-launcher 打开 APK 文件进行安装
   */
  private async installApk(uri: string): Promise<void> {
    try {
      if (Platform.OS === "android") {
        // 使用 expo-intent-launcher 打开 APK 安装
        // 使用字符串直接指定 action，避免类型问题
        await IntentLauncher.startActivityAsync(
          "android.intent.action.VIEW" as any,
          {
            data: uri,
            type: "application/vnd.android.package-archive",
          } as any,
        );
      }
    } catch (err) {
      // 如果安装失败，尝试直接打开 GitHub Release 页面让用户手动下载
      console.error("Failed to install APK:", err);
      try {
        // 打开 GitHub Release 页面
        if (this.latestRelease?.html_url) {
          await Linking.openURL(this.latestRelease.html_url);
        }
      } catch (linkErr) {
        this.error = "安装失败，请前往 GitHub Release 页面手动下载安装";
        console.error("Failed to open release page:", linkErr);
      }
    }
  }

  /**
   * 打开应用商店页面（如果有）
   */
  async openAppStore(): Promise<void> {
    // 如果 release 中有 HTML URL，可以尝试打开
    if (this.latestRelease?.html_url) {
      await Linking.openURL(this.latestRelease.html_url);
    }
  }

  /**
   * 打开 GitHub Release 页面
   */
  async openReleasePage(): Promise<void> {
    if (this.latestRelease?.html_url) {
      await Linking.openURL(this.latestRelease.html_url);
    }
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.loading = false;
    this.latestRelease = null;
    this.error = null;
    this.downloadProgress = 0;
    this.downloading = false;
    this.downloadedApkPath = null;
  }
}

export default UpdateService;
