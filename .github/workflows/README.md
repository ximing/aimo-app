# GitHub Actions Workflows

## 📦 构建工作流程

本目录包含自动构建和发布 Android 和 iOS 应用的 GitHub Actions 工作流程。

### 可用工作流程

| 工作流程 | 文件 | 说明 | 建议 |
|---------|------|------|------|
| **基础 EAS 构建** | `build-release.yml` | 简单的 EAS Cloud 构建 | ⭐ 快速测试 |
| **高级 EAS 构建** | `build-release-advanced.yml` | 完全自动化，支持自动下载和上传 | ⭐⭐⭐ **推荐** |
| **本地构建** | `build-release-local.yml` | 在 GitHub Runner 上本地构建 | ⭐ 仅自定义需求 |

### 🚀 快速开始（推荐方案）

#### 第 1 步：安装并登录 EAS

```bash
# 全局安装 EAS CLI
npm install -g eas-cli

# 登录 EAS
eas login

# 初始化 EAS 项目配置
eas build:configure
```

#### 第 2 步：Push 到 master 分支

```bash
git add .
git commit -m "feat: add new feature"
git push origin master
```

#### 第 3 步：监控工作流程运行

访问你的 GitHub 仓库 → **Actions** 标签页

#### 第 4 步：获取构建产物

构建完成后，访问 **Releases** 页面下载 APK 和 IPA 文件

---

## 📋 工作流程触发条件

- ✅ **自动触发**：Push 到 `master` 分支时自动运行
- ✅ **手动触发**：在 Actions 页面点击 "Run workflow" 按钮

---

## 📝 工作流程说明

### build-release.yml（基础版）

简单的 EAS 构建流程，适合快速测试。

**步骤：**
1. 检出代码
2. 安装依赖
3. 创建 GitHub Release
4. 启动 Android EAS Build
5. 启动 iOS EAS Build
6. 上传已有的构建产物

**优点：** 简单快速，适合 CI/CD 集成  
**缺点：** 需要手动等待和下载，无自动产物下载

---

### build-release-advanced.yml（高级版）⭐ 推荐

完整的自动化构建流程，支持实时监控和自动下载。

**步骤：**
1. 检出代码
2. 安装依赖和 EAS CLI
3. 获取版本号和提交信息
4. 创建 GitHub Release
5. 启动 Android EAS Build
6. 启动 iOS EAS Build
7. **等待 Android 构建完成并下载 APK**
8. **等待 iOS 构建完成并下载 IPA**
9. **自动上传 APK 和 IPA 到 Release**
10. 生成构建摘要

**优点：**
- ✅ 完全自动化
- ✅ 自动下载构建产物
- ✅ 自动上传到 Release
- ✅ 支持构建状态追踪
- ✅ 详细的构建信息

**缺点：** 构建时间较长（1-2 小时）

**最大等待时间：** 60 分钟（可在工作流程中配置）

---

### build-release-local.yml（本地版）

在 GitHub Runner 上直接构建，需要配置本地环境。

**步骤：**
1. **Android 构建**（在 Ubuntu runner 上）
   - 检出代码
   - 安装 Node.js 和 Java
   - 设置 Android SDK
   - 执行 Gradle 构建
   - 上传 APK

2. **iOS 构建**（在 macOS runner 上）
   - 检出代码
   - 安装 Node.js
   - 设置 Xcode
   - 编译归档
   - 导出 IPA
   - 上传 IPA

**优点：** 完全控制，可自定义构建选项  
**缺点：** 需要复杂配置，iOS 构建需要开发者账户

---

## 🔧 配置

### 创建 Release 自动化

所有工作流程都会自动：
- 读取 `package.json` 中的版本号
- 创建格式为 `v{version}-{run_number}` 的 Release Tag
- 生成 Release 说明
- 上传构建产物

**版本号示例：**
```
v1.0.0-1    # package.json 版本 1.0.0，运行编号 1
v1.0.0-2    # package.json 版本 1.0.0，运行编号 2
v1.1.0-1    # 更新版本后
```

### 更新版本号

```bash
# 修改 package.json 中的 version 字段
# 或使用 npm 命令
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

---

## 📦 输出产物

### Android APK
- **文件：** `app-android.apk`
- **大小：** 通常 50-100 MB
- **安装方式：** 直接安装到 Android 设备

### iOS IPA
- **文件：** `app-ios.ipa`
- **大小：** 通常 100-200 MB
- **安装方式：** 通过 TestFlight 或其他分发工具

---

## 🔐 权限和秘密

所有工作流程使用 GitHub 内置的 `GITHUB_TOKEN`，自动具有以下权限：

- ✅ 读取仓库代码
- ✅ 创建和更新 Release
- ✅ 上传文件到 Release

**无需手动配置任何密钥！**

---

## 📊 监控和调试

### 查看工作流程状态

1. 访问 GitHub 仓库 → **Actions** 标签
2. 点击最新的工作流运行
3. 查看实时日志

### 查看 EAS 构建状态

```bash
# 列出最近的构建
eas build:list

# 查看特定构建
eas build:view <BUILD_ID>

# 查看构建日志
eas build:logs <BUILD_ID>
```

### 常见错误排查

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `EAS_TOKEN not found` | 未登录 EAS | 运行 `eas login` |
| `Build timeout` | 构建超过 60 分钟 | 增加等待时间上限 |
| `APK not found` | 构建失败 | 查看 EAS 日志 |

---

## ⚙️ 高级配置

### 修改构建配置

编辑 `eas.json` 文件来自定义构建选项：

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"    // 或 "app-bundle"
      },
      "ios": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 修改工作流程

编辑工作流程文件（`.github/workflows/*.yml`）来：
- 改变触发条件（push、schedule、手动等）
- 添加前置条件检查
- 自定义 Release 说明
- 添加额外的构建步骤

---

## 📚 更多信息

详细指南请查看 [`WORKFLOW_GUIDE.md`](../WORKFLOW_GUIDE.md)

包括：
- 详细的配置说明
- 常见问题解答
- 故障排除指南
- 最佳实践

---

## 🎯 推荐工作流程选择

### 对于大多数用户 ⭐⭐⭐
**使用 `build-release-advanced.yml`**

- 完全自动化
- 无需手动操作
- 自动上传到 Release
- 适合生产环境

### 对于快速测试 ⭐
**使用 `build-release.yml`**

- 快速启动
- 适合验证构建配置
- 需要手动下载和上传

### 对于完全控制 ⭐（高级）
**使用 `build-release-local.yml`**

- 完全自定义
- 适合复杂场景
- 需要额外配置

---

## 📞 支持

遇到问题？

1. 查看 [`WORKFLOW_GUIDE.md`](../WORKFLOW_GUIDE.md) 中的常见问题
2. 检查 GitHub Actions 日志
3. 查看 [Expo EAS 文档](https://docs.expo.dev)
4. 提交 Issue 或联系项目维护者
