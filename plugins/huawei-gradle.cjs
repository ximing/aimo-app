const HUAWEI_REPO = "maven { url 'https://developer.huawei.com/repo/' }";
const AGCP_CLASSPATH = "classpath('com.huawei.agconnect:agcp:1.9.6.300')";
// agcp reads the AGP version from this classpath string. The Expo template leaves it
// unversioned. 8.12.0 is the AGP shipped with React Native 0.83 (Expo SDK 55).
const UNVERSIONED_AGP = "classpath('com.android.tools.build:gradle')";
const VERSIONED_AGP = "classpath('com.android.tools.build:gradle:8.12.0')";

function addHuaweiMaven(contents) {
  if (contents.includes('developer.huawei.com/repo/')) return contents;
  return contents.replace(/mavenCentral\(\)/g, `mavenCentral()\n    ${HUAWEI_REPO}`);
}

function addAgcpClasspath(contents) {
  let next = contents.includes(UNVERSIONED_AGP) ? contents.replace(UNVERSIONED_AGP, VERSIONED_AGP) : contents;
  if (next.includes('com.huawei.agconnect:agcp')) return next;
  const kotlin = "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')";
  if (next.includes(kotlin)) return next.replace(kotlin, `${kotlin}\n    ${AGCP_CLASSPATH}`);
  return next.replace(/dependencies \{\n/, `dependencies {\n    ${AGCP_CLASSPATH}\n`);
}

function applyAgcpPlugin(contents) {
  if (contents.includes('com.huawei.agconnect')) return contents;
  return `${contents.trimEnd()}\napply plugin: "com.huawei.agconnect"\n`;
}

module.exports = { addHuaweiMaven, addAgcpClasspath, applyAgcpPlugin };
