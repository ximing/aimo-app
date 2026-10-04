export type UpdatePhase =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "installing"
  | "failed";

export function isNewerRelease(currentCode: number, remoteCode: number): boolean {
  return remoteCode > currentCode;
}

export function isForcedUpdate(
  currentCode: number,
  minVersionCode: number | undefined,
): boolean {
  return minVersionCode !== undefined && currentCode < minVersionCode;
}

export function formatProgress(downloaded: number, total: number): string {
  if (!(total > 0) || !Number.isFinite(downloaded)) return "";
  const pct = Math.max(0, Math.min(100, Math.round((downloaded / total) * 100)));
  return `${pct}%`;
}

export function progressRatio(downloaded: number, total: number): number {
  if (!(total > 0) || !Number.isFinite(downloaded)) return 0;
  return Math.max(0, Math.min(1, downloaded / total));
}

export function updateActionLabel(phase: UpdatePhase, pendingPermission: boolean): string {
  if (phase === "checking") return "检查中…";
  if (phase === "downloading") return "下载中";
  if (phase === "installing") return "正在安装…";
  if (phase === "failed") return "重试";
  if (pendingPermission) return "去授权";
  if (phase === "ready") return "安装";
  return "检查更新";
}
