/**
 * Expo 动态配置文件
 * 自动从 package.json 读取版本号，确保一致性
 */

module.exports = function () {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const packageJson = require("./package.json");

  return {
    expo: {
      version: packageJson.version,
    },
  };
};
