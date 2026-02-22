/**
 * 版本比较工具
 *
 * 支持的版本格式：
 * - v1.0.0-18 (带构建号)
 * - v1.1.0 (带 v 前缀)
 * - 1.1.0 (不带 v 前缀)
 * - 1.0.0-beta.1 (预发布版本)
 */

/**
 * 解析版本号为可比较的数字数组
 * @param version 版本号字符串，如 "v1.0.0-18" 或 "1.1.0"
 * @returns [主版本, 次版本, 补丁版本, 构建号]
 */
export const parseVersion = (version: string): number[] => {
  // 移除 v 前缀
  const cleanVersion = version.replace(/^v/, "");

  // 分离主版本和构建号（如 1.0.0-18）
  const parts = cleanVersion.split("-");

  // 解析主版本号 (1.0.0)
  const versionParts = parts[0].split(".").map((part) => {
    // 处理预发布版本 (如 beta.1)
    const num = parseInt(part, 10);
    return isNaN(num) ? 0 : num;
  });

  // 构建号 (18)
  const buildNumber = parts[1] ? parseInt(parts[1], 10) : 0;

  // 返回 [主版本, 次版本, 补丁版本, 构建号]
  return [
    versionParts[0] || 0,
    versionParts[1] || 0,
    versionParts[2] || 0,
    buildNumber,
  ];
};

/**
 * 比较两个版本号
 * @param current 当前版本
 * @param latest 最新版本
 * @returns
 *   - 正数: current < latest (需要升级)
 *   - 0: current === latest (已是最新)
 *   - 负数: current > latest (比最新版本还新)
 */
export const compareVersions = (current: string, latest: string): number => {
  const currentParts = parseVersion(current);
  const latestParts = parseVersion(latest);

  // 逐级比较
  for (let i = 0; i < 4; i++) {
    if (currentParts[i] < latestParts[i]) {
      return 1; // 当前版本较低，需要升级
    } else if (currentParts[i] > latestParts[i]) {
      return -1; // 当前版本更高
    }
  }

  return 0; // 版本相同
};

/**
 * 检查是否需要升级
 * @param current 当前版本
 * @param latest 最新版本
 */
export const needsUpdate = (current: string, latest: string): boolean => {
  return compareVersions(current, latest) > 0;
};

/**
 * 格式化版本号显示
 * @param version 版本号
 */
export const formatVersion = (version: string): string => {
  // 确保有 v 前缀用于显示
  if (!version.startsWith("v")) {
    return `v${version}`;
  }
  return version;
};
