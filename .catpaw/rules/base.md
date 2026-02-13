---
ruleType: Always
---

# React Native + Expo 项目开发规范

## 1. 项目结构规范

### 1.1 目录划分

采用**按特性/页面组织（Feature-based Structure）** 的原则，全局通用组件和页面特定组件分离：

```
aimo-app/
├── app/                    # 应用程序主文件（使用 Expo Router）
│   ├── (memos)/           # 备忘录页面分组
│   │   ├── _layout.tsx
│   │   └── index.tsx      # 页面主逻辑
│   ├── (tabs)/            # 标签栏导航分组
│   ├── _layout.tsx        # 根布局
│   └── modal.tsx          # 模态框相关
├── components/            # 组件库（全局和页面特定）
│   ├── ui/               # 基础 UI 组件
│   ├── memos/            # 页面特定组件：备忘录页面
│   │   ├── search-header.tsx
│   │   ├── sidebar-drawer.tsx
│   │   ├── floating-action-bar.tsx
│   │   └── index.ts
│   ├── themed-text.tsx    # 全局主题文本组件
│   ├── themed-view.tsx    # 全局主题视图组件
│   ├── memo-item.tsx      # 全局备忘录项组件
│   └── error-boundary.tsx # 全局错误边界
├── services/             # 业务逻辑服务层（使用 @rabjs/react Service 模式）
│   ├── *.service.ts      # Service 文件
│   └── index.ts          # 服务导出入口
├── constants/            # 常量定义（主题、配置等）
├── hooks/                # 自定义 React Hooks
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数
├── assets/               # 静态资源（图片、字体等）
├── scripts/              # 项目工具脚本
├── app.json              # Expo 应用配置
├── package.json          # 项目依赖
└── tsconfig.json         # TypeScript 配置
```

### 1.2 文件命名规范

**所有文件命名只允许 kebab-case 形式**（除特殊说明外）

- **组件文件**：使用 PascalCase（如 `ThemedText.tsx`）
- **Hooks 文件**：使用 kebab-case 并以 `use-` 前缀（如 `use-color-scheme.ts`）
- **常量文件**：使用 kebab-case（如 `theme-colors.ts`）
- **Service 文件**：使用 kebab-case 并以 `.service.ts` 后缀（如 `auth-service.ts`）
- **工具函数文件**：使用 kebab-case（如 `format-date.ts`）
- **平台特定文件**：使用 `.ios.ts` 或 `.android.ts` 后缀（如 `use-color-scheme.web.ts`）

### 1.3 页面特定组件的组织规则

**全局组件 vs 页面特定组件**：

- **全局通用组件**（`components/` 目录）
  - 跨多个页面/功能使用的通用 UI 组件
  - 例如：`MemoItem`、`ErrorBoundary`、`ui/Button` 等
  - 对页面业务逻辑无依赖，可以在任何地方使用

- **页面特定组件**（`components/[feature]/` 目录）
  - 仅在特定页面内使用的组件，但放在 `components/` 下以避免 Expo Router 路由冲突
  - 通过子目录组织，保持高内聚性，组件与页面逻辑紧密关联
  - 例如：`components/memos/SearchHeader`、`components/memos/SidebarDrawer` 等
  - 用 `index.ts` 统一导出，简化导入路径

**为什么不能放在 `app/[feature]/components/`？**：
- Expo Router 会扫描 `app/` 下的所有文件和目录
- 即使使用 `_` 前缀，Expo Router 仍会要求目录中的文件有默认导出
- 将非路由文件放在 `app/` 外可以避免路由污染和不必要的警告

**页面特定组件的目录结构**：
```typescript
components/
├── memos/                  # 页面特定组件分组
│   ├── search-header.tsx
│   ├── sidebar-drawer.tsx
│   ├── floating-action-bar.tsx
│   └── index.ts            # 统一导出
└── ui/                     # 基础 UI 组件
```

**导出和导入示例**：
```typescript
// components/memos/index.ts
export { SearchHeader } from './search-header';
export { SidebarDrawer } from './sidebar-drawer';
export { FloatingActionBar } from './floating-action-bar';

// app/(memos)/index.tsx
import { SearchHeader, SidebarDrawer, FloatingActionBar } from '@/components/memos';
```

**迁移规则**：
- 如果某个页面特定组件在多个地方被使用，直接将其提升到 `components/` 根目录
- 新增功能时，在 `components/[feature]/` 下创建子目录组织页面特定组件

## 2. 代码规范

### 2.1 TypeScript 使用

- 所有组件和文件必须使用 TypeScript
- 严格模式：`"strict": true` 已在 tsconfig.json 中启用
- 避免使用 `any` 类型，应明确定义类型

### 2.2 React Native 组件规范

- 使用函数式组件和 Hooks
- 组件应该是纯函数，避免副作用
- 使用 `memo` 来优化性能关键的组件
- 示例：

```typescript
import React, { memo } from 'react';
import { View, Text } from 'react-native';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const MyComponent = memo(({ title, children }: Props) => {
  return (
    <View>
      <Text>{title}</Text>
      {children}
    </View>
  );
});

MyComponent.displayName = 'MyComponent';
```

### 2.3 Hooks 规范

- 自定义 Hooks 文件存放在 `hooks/` 目录
- 命名必须以 `use` 开头
- 遵循 React Hooks 规则（不在条件中调用、不在循环中调用）
- 示例：

```typescript
import { useEffect, useState } from "react";

export function useCustomHook(initialValue: string) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // 副作用逻辑
  }, []);

  return [state, setState] as const;
}
```

### 2.4 样式规范

- 使用 `StyleSheet.create()` 创建样式对象
- 支持主题的组件应使用 `useColorScheme` Hook
- 示例：

```typescript
import { StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export function MyComponent() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  return <View style={[styles.container, { backgroundColor }]} />;
}
```

### 2.5 状态管理规范（@rabjs/react）

**所有使用状态管理的场景均需要使用 `@rabjs/react`，提供了基于响应式的状态管理方案。**

#### 2.5.1 核心特性

- 🚀 **响应式组件** - 使用 `observer` / `view` HOC 自动追踪 observable 变化
- 🎣 **Hooks 支持** - `useService`、`useObserverService`、`useLocalObservable` 等
- 💉 **依赖注入** - 内置 IOC 容器，支持 Service 模式和依赖注入
- ⚡️ **并发模式** - 完全支持 React 18+ 的并发特性
- 📝 **TypeScript** - 完整的类型支持

#### 2.5.2 安装

```bash
npm install @rabjs/react
```

#### 2.5.3 使用场景

**应该使用 @rabjs/react 的情况：**

- ✅ `*.service.ts` - 业务逻辑服务层
- ✅ 页面级状态管理 - 复杂页面的状态管理
- ✅ 全局状态 - 应用级状态（主题、用户信息等）
- ✅ 跨组件数据共享 - 兄弟组件或远距离组件通信

**不应该使用的场景：**

- ❌ 组件内部临时状态 - 使用 React `useState`
- ❌ 简单的 props 透传 - 直接 props 即可
- ❌ 副作用处理 - 使用 React `useEffect`

#### 2.5.4 Service 模式（推荐）

所有业务逻辑应该写在 Service 中，文件存放在 `services/` 目录，文件名以 `.service.ts` 结尾。

**定义 Service 示例：**

```typescript
// services/noteService.ts
import { Service, Inject } from "@rabjs/react";
import { AuthService } from "./auth-service";

class NoteService extends Service {
  // 响应式属性
  notes: Note[] = [];
  selectedNoteId: string | null = null;
  loading = false;

  // 注入其他服务
  @Inject(AuthService) authService!: AuthService;

  // 计算属性
  get selectedNote() {
    return this.notes.find((n) => n.id === this.selectedNoteId);
  }

  // 获取用户的笔记
  get userNotes() {
    const userId = this.authService.currentUser?.id;
    return this.notes.filter((n) => n.userId === userId);
  }

  // 异步方法（自动追踪 loading 和 error）
  async fetchNotes() {
    this.loading = true;
    try {
      const response = await fetch("/api/notes");
      this.notes = await response.json();
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      this.loading = false;
    }
  }

  // 同步方法（自动批量更新）
  addNote(note: Note) {
    this.notes.push(note);
  }

  selectNote(noteId: string) {
    this.selectedNoteId = noteId;
  }
}

export default NoteService;
```

**在组件中使用 Service：**

```typescript
// app/(tabs)/index.tsx
import { useService, bindServices } from "@rabjs/react";
import NoteService from "@/services/noteService";

const HomeContent = () => {
  const noteService = useService(NoteService);

  return (
    <View>
      {noteService.loading && <Text>加载中...</Text>}
      {noteService.userNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onPress={() => noteService.selectNote(note.id)}
        />
      ))}
    </View>
  );
};

// 使用 bindServices 将 Service 注入组件
export default bindServices(HomeContent, [NoteService]);
```

#### 2.5.5 多层级 Service 架构

支持应用级、页面级、组件级 Service 的多层级嵌套：

```typescript
// app/_layout.tsx - 应用根（全局 Service）
const AppContent = () => {
  const themeService = useService(ThemeService);
  const authService = useService(AuthService);
  return <AppNavigator />;
};

export default bindServices(AppContent, [ThemeService, AuthService]);

// app/(tabs)/index.tsx - 页面级 Service
const HomeContent = () => {
  const noteService = useService(NoteService); // 页面级
  const themeService = useService(ThemeService); // 全局 Service，可直接访问
  return <NoteList />;
};

export default bindServices(HomeContent, [NoteService]);

// components/NoteCard.tsx - 组件级使用
import { view } from "@rabjs/react";

export const NoteCard = view(({ note }: Props) => {
  const noteService = useService(NoteService);
  return <TouchableOpacity onPress={() => noteService.selectNote(note.id)} />;
});
```

#### 2.5.6 异步状态访问

Service 中的异步方法会自动追踪 `loading` 和 `error` 状态：

```typescript
class NoteService extends Service {
  async fetchNotes() {
    // 异步操作
  }
}

// 在组件中访问
const NoteList = view(() => {
  const noteService = useService(NoteService);
  
  return (
    <>
      {noteService.$model.fetchNotes.loading && <LoadingSpinner />}
      {noteService.$model.fetchNotes.error && <ErrorMessage />}
      {/* ... */}
    </>
  );
});
```

#### 2.5.7 性能优化

使用 `useObserverService` 进行细粒度追踪，仅在特定字段变化时重新渲染：

```typescript
// 只在 notes.length 变化时重新渲染
const [notesCount, noteService] = useObserverService(
  NoteService,
  (service) => service.notes.length
);

return <Text>笔记总数: {notesCount}</Text>;
```

#### 2.5.8 最佳实践

- **逻辑分离**：所有业务逻辑放在 Service，组件只负责 UI 展示
- **服务文件命名**：使用 `*.service.ts` 命名约定
- **依赖注入**：使用 `@Inject` 注入服务依赖，实现松耦合
- **计算属性**：使用 getter 定义衍生状态，避免重复数据
- **避免在组件中修改状态**：所有状态修改通过 Service 方法进行
- **自动特性**：Service 实例默认响应式，方法默认 Action，无需装饰器

**更多详细信息请查看：`@rabjs/react` 规则文档**

## 3. 导航规范（Expo Router）

### 3.1 路由文件组织

- 使用文件系统路由结构
- 动态路由使用 `[param]` 语法
- 分组路由使用 `(groupName)` 语法
- 所有路由文件必须导出默认组件

### 3.2 布局配置

- 在 `app/(tabs)/_layout.tsx` 配置标签栏导航
- 在 `app/_layout.tsx` 配置根布局
- 使用 `expo-linking` 配置深链接

## 4. 依赖管理规范

### 4.1 核心依赖

- **React Native**: `0.81.5`
- **React**: `19.1.0`
- **Expo**: `~54.0.33`
- **Expo Router**: `~6.0.23`（用于导航）

### 4.2 社区库使用

- 仅安装必要的社区库
- 优先选择 Expo 官方支持的库
- 在 `package.json` 中明确版本约束

### 4.3 版本管理

- 使用语义版本化
- 定期更新依赖，特别是安全更新
- 更新前测试跨平台兼容性

## 5. Linting 和代码格式

### 5.1 ESLint 配置

- 使用 `eslint-config-expo` 作为基础配置
- 运行 `npm run lint` 检查代码质量
- 在提交前确保通过 linting

### 5.2 TypeScript 检查

- 运行 `tsc --noEmit` 检查类型
- 避免 TypeScript 错误和警告

## 6. 资源管理规范

### 6.1 图片资源

- 存放在 `assets/images/` 目录
- 提供多分辨率的图片 (@1x, @2x, @3x)
- 使用 `expo-image` 组件加载图片
- 示例：

```typescript
import { Image } from 'expo-image';

export function MyImage() {
  return (
    <Image
      source={require('@/assets/images/icon.png')}
      style={{ width: 100, height: 100 }}
    />
  );
}
```

### 6.2 字体资源

- 使用 `expo-font` 管理自定义字体
- 在应用初始化时预加载字体

## 7. 跨平台开发规范

### 7.1 平台特定代码

- 使用文件扩展名区分：`.ios.ts`, `.android.ts`, `.web.ts`
- 使用 `Platform` 模块进行条件编译
- 示例：

```typescript
import { Platform } from "react-native";

const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";
const isWeb = Platform.OS === "web";
```

### 7.2 API 兼容性

- 测试 iOS、Android 和 Web 平台
- 使用平台特定的 API 时添加降级方案

## 8. 开发工作流

### 8.1 开发命令

```bash
npm start          # 启动开发服务器
npm run ios        # 在 iOS 模拟器上运行
npm run android    # 在 Android 模拟器上运行
npm run web        # 在 Web 浏览器中运行
npm run lint       # 运行 ESLint 检查
```

### 8.2 环境配置

- 使用 `app.json` 配置应用元数据
- 使用 `expo-constants` 获取编译时常量
- 使用环境变量存储敏感信息

## 9. 常见最佳实践

### 9.1 性能优化

- 使用 `React.memo` 避免不必要的重新渲染
- 使用 `useMemo` 和 `useCallback` 优化 Hooks
- 延迟加载大型列表（使用 FlatList 的 `windowSize`）
- 压缩图片资源

### 9.2 错误处理

- 使用 try-catch 处理异步操作
- 提供用户友好的错误提示
- 在 Root 布局添加错误边界

### 9.3 测试建议

- 编写单元测试（使用 Jest）
- 进行跨平台测试
- 测试不同屏幕尺寸的响应式设计

## 10. 提交规范

### 10.1 Git 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型包括：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建或依赖变更

示例：

```
feat(navigation): add home screen tab

- Implement home screen component
- Add navigation routing configuration

Closes #123
```

## 11. 注意事项

- 始终在真实设备或模拟器上测试
- 定期检查 Expo 更新和安全补丁
- 保持依赖版本同步，避免版本冲突
- 在修改 `app.json` 后重启开发服务器
- 使用 `expo prebuild` 生成原生项目（如需）
