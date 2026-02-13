# 项目架构说明

本项目采用分层架构设计，将 API 请求层、类型定义层和状态管理层分离。

## 整体架构

```
aimo-app/
├── api/                          # API 请求层（函数式）
│   ├── common.ts                # 通用工具、配置、基础请求函数
│   ├── auth.ts                  # 认证相关 API 函数
│   ├── user.ts                  # 用户相关 API 函数
│   ├── memo.ts                  # 笔记相关 API 函数
│   ├── category.ts              # 分类相关 API 函数
│   ├── attachment.ts            # 附件相关 API 函数
│   ├── backup.ts                # 备份相关 API 函数
│   └── index.ts                 # API 导出入口
│
├── types/                        # TypeScript 类型定义层
│   ├── common.ts                # 通用类型（ApiResponse、错误码等）
│   ├── auth.ts                  # 认证相关类型
│   ├── user.ts                  # 用户相关类型
│   ├── memo.ts                  # 笔记相关类型
│   ├── category.ts              # 分类相关类型
│   ├── attachment.ts            # 附件相关类型
│   └── backup.ts                # 备份相关类型
│
├── services/                     # 业务逻辑层（@rabjs/react Service）
│   ├── memo-service.ts          # 笔记业务逻辑 + 状态管理
│   ├── categoryService.ts       # 分类业务逻辑 + 状态管理
│   ├── userService.ts           # 用户业务逻辑 + 状态管理
│   └── ...                      # 其他服务
│
├── app/                         # 应用层（Expo Router）
│   ├── (tabs)/                 # 标签栏导航
│   ├── _layout.tsx             # 根布局
│   └── ...
│
├── components/                  # UI 组件层
│   ├── ui/                     # 基础组件
│   └── ...                     # 功能组件
│
└── docs/                        # 文档
    ├── api/                    # API 文档
    ├── API_USAGE.md            # API 使用指南
    ├── API_EXAMPLES.md         # API 使用示例
    └── ARCHITECTURE.md         # 本文件
```

## 分层说明

### 1. API 层 (`api/`)

**职责**: 直接调用 HTTP 接口，处理请求和响应

**特点**:
- 纯函数，无状态
- 直接返回数据或抛出错误
- 自动处理 token 附加
- 支持 FormData 上传

**示例**:
```typescript
// api/memo.ts
export const getMemos = async (params?: ListMemosParams): Promise<MemoListResponse> => {
  const response = await apiGet<MemoListResponse>('/memos?...');
  if (response.code !== 0) {
    throw new Error(response.message);
  }
  return response.data;
};
```

**使用场景**:
- 直接在组件中使用（简单页面）
- 在 Service 中使用（推荐）
- 在 Hook 中使用

### 2. 类型定义层 (`types/`)

**职责**: 定义所有的 TypeScript 类型

**特点**:
- 按模块分离（一个 API 文档对应一个类型文件）
- 明确区分请求和响应类型
- 导出所有类型供外部使用

**示例**:
```typescript
// types/memo.ts
export interface Memo {
  memoId: string;
  content: string;
  // ...
}

export interface CreateMemoRequest {
  content: string;
  // ...
}
```

### 3. 服务层 (`services/`)

**职责**: 业务逻辑处理和状态管理

**特点**:
- 基于 `@rabjs/react` 的 Service 模式
- 管理组件状态（loading、error、数据）
- 响应式属性自动触发重新渲染
- 支持依赖注入

**示例**:
```typescript
// services/memo-service.ts
class MemoService extends Service {
  memos: Memo[] = [];
  loading = false;

  async fetchMemos() {
    this.loading = true;
    try {
      const result = await getMemos(); // 调用 API 层
      this.memos = result.items;
    } finally {
      this.loading = false;
    }
  }
}
```

### 4. 应用层和 UI 层

**应用层** (`app/`):
- 路由配置
- 页面布局

**UI 层** (`components/`):
- 可复用的 UI 组件
- 使用 Service 获取数据

## 数据流

```
用户交互
    ↓
组件事件处理
    ↓
调用 Service 方法
    ↓
Service 调用 API 函数
    ↓
API 函数发送 HTTP 请求
    ↓
获取响应数据
    ↓
Service 更新状态
    ↓
组件自动重新渲染
    ↓
显示最新数据
```

## 通信流程

### 简单流程（直接调用 API）

```typescript
// 组件直接调用 API（仅用于简单场景）
const handleClick = async () => {
  try {
    const memos = await getMemos();
    setData(memos);
  } catch (error) {
    setError(error.message);
  }
};
```

### 推荐流程（使用 Service）

```typescript
// 1. Service 中定义业务逻辑
class MemoService extends Service {
  async fetchMemos() {
    this.loading = true;
    try {
      const result = await getMemos(); // 调用 API
      this.memos = result.items;
    } finally {
      this.loading = false;
    }
  }
}

// 2. 组件中使用 Service
const MemoList = view(() => {
  const memoService = useService(MemoService);
  
  return (
    <View>
      {memoService.loading && <Text>加载中...</Text>}
      {memoService.memos.map(memo => <Text>{memo.content}</Text>)}
    </View>
  );
});
```

## 关键概念

### 依赖注入

Service 可以注入其他 Service，实现依赖管理：

```typescript
class OrderService extends Service {
  @Inject(UserService) userService!: UserService;

  async getOrders() {
    const user = this.userService.userInfo;
    // 使用 user 信息获取订单
  }
}
```

### 响应式更新

修改 Service 的属性会自动触发组件重新渲染：

```typescript
class MemoService extends Service {
  memos = []; // 当这个属性改变时，使用它的组件会自动重新渲染

  addMemo(memo) {
    this.memos.push(memo); // 直接修改，无需手动通知更新
  }
}
```

### 异步状态追踪

```typescript
class MemoService extends Service {
  async fetchMemos() {
    this.loading = true;    // 进入加载状态
    try {
      this.memos = await getMemos();
      this.error = null;    // 清除错误
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false; // 退出加载状态
    }
  }
}
```

## 错误处理

### API 层错误处理

```typescript
export const getMemos = async (): Promise<Memo[]> => {
  const response = await apiGet<MemoListResponse>('/memos');
  
  if (response.code !== 0) {
    throw new Error(response.message); // 抛出错误让上层处理
  }
  
  return response.data.items;
};
```

### Service 层错误处理

```typescript
class MemoService extends Service {
  error: string | null = null;

  async fetchMemos() {
    try {
      this.memos = await getMemos();
      this.error = null;
    } catch (error) {
      this.error = error.message; // 保存错误状态
    }
  }
}
```

### 组件层错误处理

```typescript
const MemoList = view(() => {
  const memoService = useService(MemoService);
  
  return (
    <View>
      {memoService.error && (
        <Text style={{ color: 'red' }}>{memoService.error}</Text>
      )}
    </View>
  );
});
```

## 最佳实践

### 1. 保持 API 函数纯净

✅ 好的做法：
```typescript
export const getMemos = async () => {
  const response = await apiGet('/memos');
  if (response.code !== 0) throw new Error(response.message);
  return response.data;
};
```

❌ 避免：
```typescript
// 不要在 API 层管理状态
let loading = false;
export const getMemos = async () => {
  loading = true; // ❌ API 层不应该有状态
  // ...
};
```

### 2. Service 中处理状态

✅ 好的做法：
```typescript
class MemoService extends Service {
  memos = [];
  loading = false;

  async fetchMemos() {
    this.loading = true;
    try {
      this.memos = await getMemos();
    } finally {
      this.loading = false;
    }
  }
}
```

❌ 避免：
```typescript
// 不要在组件中处理所有状态
const [memos, setMemos] = useState([]);
const [loading, setLoading] = useState(false);
// ... 复杂的状态管理代码
```

### 3. 合理使用 Hook

对于简单的数据获取，可以创建自定义 Hook：

```typescript
export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getMemos();
      setMemos(result.items);
    } finally {
      setLoading(false);
    }
  };

  return { memos, loading, load };
}
```

但对于复杂的业务逻辑，优先使用 Service。

## 配置和常量

### API 基础配置

所有 API 配置都在 `api/common.ts` 中：

```typescript
export const BASE_URL = 'https://memo.aisoil.fun/api/v1';
export const TOKEN_KEY = 'aimo_token';
```

如需修改：
1. 编辑 `api/common.ts`
2. 其他文件会自动使用新配置

## 扩展新的 API

当需要添加新的 API 时，按以下步骤：

1. **创建类型文件** (`types/newApi.ts`):
```typescript
export interface NewItem {
  id: string;
  // ...
}

export interface ListNewItemsResponse {
  items: NewItem[];
  // ...
}
```

2. **创建 API 文件** (`api/newApi.ts`):
```typescript
export const getNewItems = async (): Promise<NewItem[]> => {
  const response = await apiGet<ListNewItemsResponse>('/newItems');
  if (response.code !== 0) throw new Error(response.message);
  return response.data.items;
};
```

3. **导出到 API 入口** (`api/index.ts`):
```typescript
export * from './newApi';
export type * from '@/types/newApi';
```

4. **创建 Service**（如需要）:
```typescript
class NewItemService extends Service {
  items: NewItem[] = [];

  async fetchItems() {
    this.items = await getNewItems();
  }
}
```

## 性能优化

### 1. 缓存数据

```typescript
class MemoService extends Service {
  memos: Memo[] = [];
  private lastFetchTime = 0;

  async fetchMemos() {
    const now = Date.now();
    if (now - this.lastFetchTime < 60000) {
      return this.memos; // 1分钟内使用缓存
    }

    this.memos = await getMemos();
    this.lastFetchTime = now;
    return this.memos;
  }
}
```

### 2. 分页加载

```typescript
class MemoService extends Service {
  async loadMore() {
    if (!this.hasNextPage) return;

    const nextPageResult = await getMemos({
      page: this.currentPage + 1,
    });

    this.memos.push(...nextPageResult.items);
    this.currentPage++;
  }
}
```

### 3. 细粒度依赖追踪

```typescript
const [count] = useObserverService(
  MemoService,
  (service) => service.memos.length
);
```

## 测试

### 测试 API 函数

```typescript
// 模拟 fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ code: 0, data: { items: [] } }),
  })
);

test('getMemos should return memos', async () => {
  const result = await getMemos();
  expect(result.items).toBeDefined();
});
```

### 测试 Service

```typescript
test('MemoService should fetch memos', async () => {
  const service = new MemoService();
  await service.fetchMemos();
  expect(service.memos.length).toBeGreaterThan(0);
});
```

## 相关文档

- [API 使用指南](./API_USAGE.md)
- [API 使用示例](./API_EXAMPLES.md)
- [API 文档](./api/)
- [@rabjs/react 规范](../.catpaw/rules/rs-react.md)
