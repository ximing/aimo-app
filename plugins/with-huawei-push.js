const fs = require('fs');
const path = require('path');
const {
  withAppBuildGradle,
  withDangerousMod,
  withProjectBuildGradle,
} = require('@expo/config-plugins');
const { addAgcpClasspath, addHuaweiMaven, applyAgcpPlugin } = require('./huawei-gradle.cjs');

/** Copies agconnect-services.json into the Android app and applies the Huawei gradle plugin. */
function withHuaweiPush(config) {
  config = withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') return mod;
    mod.modResults.contents = addAgcpClasspath(addHuaweiMaven(mod.modResults.contents));
    return mod;
  });
  config = withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') return mod;
    const json = path.join(mod.modRequest.projectRoot, 'agconnect-services.json');
    if (!fs.existsSync(json)) return mod;
    mod.modResults.contents = applyAgcpPlugin(mod.modResults.contents);
    return mod;
  });
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, 'agconnect-services.json');
      const dest = path.join(cfg.modRequest.platformProjectRoot, 'app', 'agconnect-services.json');
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
      return cfg;
    },
  ]);
}

module.exports = withHuaweiPush;
