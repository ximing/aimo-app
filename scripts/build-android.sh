#!/usr/bin/env bash
# 本地构建 Android Release APK
# 用法:
#   ./scripts/build-android.sh                    # 交互式输入 keystore 信息
#   ./scripts/build-android.sh --keystore <path>  # 指定 keystore 路径（其余参数从环境变量读取）
#
# 环境变量（可选，避免交互输入）：
#   KEYSTORE_PATH      keystore 文件路径
#   KEYSTORE_PASSWORD  keystore 密码
#   KEY_ALIAS          key alias
#   KEY_PASSWORD       key 密码

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ── 加载 .env 文件 ────────────────────────────────────────────
if [[ -f "$ROOT_DIR/.env" ]]; then
  # 忽略空行和注释行，支持 KEY=VALUE 和 export KEY=VALUE
  set -o allexport
  # shellcheck source=/dev/null
  source <(grep -v '^\s*#' "$ROOT_DIR/.env" | grep -v '^\s*$' | sed 's/^export //')
  set +o allexport
  echo -e "\033[32m✅ 已加载 .env\033[0m"
fi

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

log()  { echo -e "${BOLD}$*${RESET}"; }
ok()   { echo -e "${GREEN}✅ $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠️  $*${RESET}"; }
fail() { echo -e "${RED}❌ $*${RESET}"; exit 1; }

# ── 1. 解析参数 ──────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --keystore) KEYSTORE_PATH="$2"; shift 2 ;;
    *) fail "未知参数: $1" ;;
  esac
done

# ── 2. 收集签名信息 ──────────────────────────────────────────
log "\n🔑 签名配置"

if [[ -z "${KEYSTORE_PATH:-}" ]]; then
  read -rp "  Keystore 路径: " KEYSTORE_PATH
fi
[[ -f "$KEYSTORE_PATH" ]] || fail "Keystore 文件不存在: $KEYSTORE_PATH"

if [[ -z "${KEYSTORE_PASSWORD:-}" ]]; then
  read -rsp "  Keystore 密码: " KEYSTORE_PASSWORD; echo
fi

if [[ -z "${KEY_ALIAS:-}" ]]; then
  read -rp "  Key Alias: " KEY_ALIAS
fi

if [[ -z "${KEY_PASSWORD:-}" ]]; then
  read -rsp "  Key 密码: " KEY_PASSWORD; echo
fi

# 转为绝对路径
KEYSTORE_PATH="$(cd "$(dirname "$KEYSTORE_PATH")" && pwd)/$(basename "$KEYSTORE_PATH")"

# ── 3. 安装依赖 ──────────────────────────────────────────────
log "\n📦 安装依赖"
npm install
ok "依赖安装完成"

# ── 4. Expo Prebuild ─────────────────────────────────────────
log "\n🔧 Expo Prebuild（生成 android/ 原生项目）"
npx expo prebuild --platform android --non-interactive --clean
ok "Prebuild 完成"

# ── 5. 配置 Gradle JVM 内存 ──────────────────────────────────
log "\n⚙️  配置 Gradle JVM 内存"
GRADLE_PROPS="$ROOT_DIR/android/gradle.properties"
# 避免重复写入
if ! grep -q "MaxMetaspaceSize" "$GRADLE_PROPS" 2>/dev/null; then
  echo "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError" >> "$GRADLE_PROPS"
  ok "已追加 JVM 内存配置"
else
  warn "JVM 内存配置已存在，跳过"
fi

# ── 6. 构建 Release APK ──────────────────────────────────────
log "\n🏗  构建 Release APK（需要几分钟）"
chmod +x android/gradlew
cd android
./gradlew assembleRelease --no-daemon \
  -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
  -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
  -Pandroid.injected.signing.key.password="$KEY_PASSWORD"
cd "$ROOT_DIR"

# ── 7. 复制 APK 到项目根目录 ─────────────────────────────────
log "\n📋 定位 APK"
APK_SRC=$(find android/app/build/outputs/apk/release -name "*.apk" | head -1)
[[ -n "$APK_SRC" ]] || fail "未找到 APK，构建可能失败"

VERSION=$(node -p "require('./package.json').version")
APK_DEST="app-release-v${VERSION}.apk"
cp "$APK_SRC" "$APK_DEST"

ok "构建完成！"
echo -e "\n  📦 APK 路径: ${BOLD}${ROOT_DIR}/${APK_DEST}${RESET}"
echo -e "  📏 文件大小: $(du -sh "$APK_DEST" | cut -f1)"
