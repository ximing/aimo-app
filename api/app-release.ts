/**
 * Android update catalog from the AIMO server.
 * The server reads GitHub Releases for ximing/aimo-app.
 */

import { apiGet } from "./common";

export interface AndroidRelease {
  versionName: string;
  versionCode: number;
  apkUrl: string;
  sha256?: string;
  sizeBytes?: number;
  releaseNotes?: string;
  minVersionCode?: number;
}

export async function getAndroidRelease(): Promise<AndroidRelease | null> {
  const response = await apiGet<{ android: AndroidRelease | null }>("/system/open/android");
  if (response.code !== 0) {
    throw new Error(response.msg || "检查更新失败");
  }
  return response.data?.android ?? null;
}
