#!/bin/bash

# GitHub Actions Workflows 初始化脚本
# 此脚本帮助配置 EAS 和 GitHub Actions

set -e

echo "=========================================="
echo "GitHub Actions 工作流程初始化"
echo "=========================================="
echo ""

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 Node.js"
    exit 1
fi

echo "✅ 检测到 npm 已安装"
echo ""

# 检查 EAS CLI 是否安装
echo "检查 EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI 未安装，正在安装..."
    npm install -g eas-cli
    echo "✅ EAS CLI 安装完成"
else
    echo "✅ EAS CLI 已安装"
fi

echo ""

# 检查 EAS 是否登录
echo "检查 EAS 登录状态..."
if eas whoami &> /dev/null; then
    echo "✅ 已登录 EAS"
    eas whoami
else
    echo "❌ 未登录 EAS"
    echo "请执行以下命令登录："
    echo "  eas login"
    echo ""
    exit 1
fi

echo ""

# 检查 eas.json 是否存在
if [ -f "eas.json" ]; then
    echo "✅ eas.json 已存在"
else
    echo "❌ eas.json 不存在，正在创建..."
    eas build:configure
    echo "✅ eas.json 创建完成"
fi

echo ""

# 验证工作流程文件
echo "验证工作流程文件..."
WORKFLOW_FILES=(
    ".github/workflows/build-release.yml"
    ".github/workflows/build-release-advanced.yml"
    ".github/workflows/build-release-local.yml"
)

for file in "${WORKFLOW_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "⚠️  $file 不存在"
    fi
done

echo ""

# 显示下一步操作
echo "=========================================="
echo "初始化完成！"
echo "=========================================="
echo ""
echo "下一步操作："
echo ""
echo "1. 验证 eas.json 配置："
echo "   cat eas.json"
echo ""
echo "2. Push 代码到 master 分支："
echo "   git push origin master"
echo ""
echo "3. 监控工作流程运行："
echo "   访问 GitHub 仓库 → Actions 标签"
echo ""
echo "4. 查看发布版本："
echo "   访问 GitHub 仓库 → Releases 标签"
echo ""
echo "推荐的工作流程："
echo "  - 生产环境：build-release-advanced.yml"
echo "  - 快速测试：build-release.yml"
echo "  - 本地构建：build-release-local.yml"
echo ""
echo "详细信息请查看："
echo "  - .github/workflows/README.md"
echo "  - .github/WORKFLOW_GUIDE.md"
echo ""
