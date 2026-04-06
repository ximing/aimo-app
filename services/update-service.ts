/**
 * 版本检查服务
 *
 * 功能：
 * - 从构建时注入的 latest.json 地址检查最新版本
 * - 比较版本号判断是否需要升级
 * - 提供 APK 下载和安装功能
 */

import { Service } from "@rabjs/react";
import * as Linking from "expo-linking";
import { File, Paths } from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";
import {
  getLatestRelease,
  getLatestJsonUrl,
  getApkDownloadUrl,
  getAppVersion,
  type LatestReleaseManifest,
} from "@/api/github";
import { needsUpdate } from "@/utils/version";

class UpdateService extends Service {
  /**
   * 当前检查状态
   */
  loading = false;

  /**
   * latest.json 中的最新版本信息
   */
  latestRelease: LatestReleaseManifest | null = null;

  /**
   * latest.json 地址（构建时注入）
   */
  latestJsonUrl: string | null = getLatestJsonUrl();

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
    return this.latestRelease?.version ?? null;
  }

  /**
   * 检查是否有可用更新
   */
  get hasUpdate(): boolean {
    if (!this.latestRelease?.version) return false;
    return needsUpdate(this.currentVersion, this.latestRelease.version);
  }

  /**
   * 检查更新
   */
  async checkForUpdate(): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const latestJsonUrl = getLatestJsonUrl();
      if (!latestJsonUrl) {
        // 未配置 latest.json，跳过更新检查
        this.loading = false;
        return false;
      }

      this.latestJsonUrl = latestJsonUrl;
      this.latestRelease = await getLatestRelease(latestJsonUrl);
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

    const directDownloadUrl = getApkDownloadUrl(this.latestRelease);
    if (directDownloadUrl) {
      return directDownloadUrl;
    }

    // 兜底：当 latest.json 只提供 path 字段时，基于 latest.json URL 计算下载地址
    if (this.latestJsonUrl && this.latestRelease.path) {
      const baseUrl = this.latestJsonUrl.replace(/\/latest\.json(\?.*)?$/i, "");
      const normalizedPath = this.latestRelease.path.replace(/^\//, "");
      return `${baseUrl}/${normalizedPath}`;
    }

    return null;
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
      // 如果安装失败，尝试打开下载链接让用户手动下载安装
      console.error("Failed to install APK:", err);
      try {
        await this.openReleasePage();
      } catch (linkErr) {
        this.error = "安装失败，请手动下载安装";
        console.error("Failed to open download page:", linkErr);
      }
    }
  }

  /**
   * 打开应用商店页面（兼容方法，当前跳转下载链接）
   */
  async openAppStore(): Promise<void> {
    await this.openReleasePage();
  }

  /**
   * 打开下载页面
   */
  async openReleasePage(): Promise<void> {
    const apkUrl = this.getApkUrl();
    if (apkUrl) {
      await Linking.openURL(apkUrl);
      return;
    }

    if (this.latestJsonUrl) {
      await Linking.openURL(this.latestJsonUrl);
      return;
    }

    this.error = "未配置升级地址";
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
