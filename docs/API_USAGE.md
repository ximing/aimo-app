# API 使用指南

本文档说明如何在应用中使用实现的 API 函数。

## 基本配置

所有 API 请求都使用以下基础 URL：
```
https://memo.aisoil.fun/api/v1
```

## 项目结构

```
aimo-app/
├── api/                       # API 层（函数式）
│   ├── common.ts             # 通用工具和配置
│   ├── auth.ts               # 认证接口
│   ├── user.ts               # 用户接口
│   ├── memo.ts               # 笔记接口
│   ├── category.ts           # 分类接口
│   ├── attachment.ts         # 附件接口
│   ├── backup.ts             # 备份接口
│   └── index.ts              # API 导出入口
├── types/                     # TypeScript 类型定义
│   ├── common.ts             # 通用类型
│   ├── auth.ts               # 认证类型
│   ├── user.ts               # 用户类型
│   ├── memo.ts               # 笔记类型
│   ├── category.ts           # 分类类型
│   ├── attachment.ts         # 附件类型
│   └── backup.ts             # 备份类型
└── services/                  # 业务逻辑层（@rabjs/react）
    # 在这里使用 @rabjs/react 的 Service 模式处理状态管理
```

## 已实现的 API 函数

### 认证 (Auth)

**导入**:
```typescript
import { register, login } from '@/api';
```

**函数**:
- `register(params)` - 注册用户
- `login(params)` - 登录用户

**使用示例**:
```typescript
// 注册
const user = await register({
  email: 'user@example.com',
  password: 'password123',
  nickname: 'John Doe',
});

// 登录
const { token, user } = await login({
  email: 'user@example.com',
  password: 'password123',
});
```

### 用户 (User)

**导入**:
```typescript
import { getUserInfo, updateUserInfo } from '@/api';
```

**函数**:
- `getUserInfo()` - 获取当前用户信息
- `updateUserInfo(params)` - 更新用户信息

**使用示例**:
```typescript
// 获取用户信息
const userInfo = await getUserInfo();

// 更新用户信息
const updated = await updateUserInfo({
  nickname: 'Jane Doe',
  phone: '+1234567890',
});
```

### 分类 (Category)

**导入**:
```typescript
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api';
```

**函数**:
- `getCategories()` - 获取所有分类
- `getCategory(categoryId)` - 获取单个分类
- `createCategory(params)` - 创建分类
- `updateCategory(categoryId, params)` - 更新分类
- `deleteCategory(categoryId)` - 删除分类

**使用示例**:
```typescript
// 获取所有分类
const categories = await getCategories();

// 创建分类
const newCategory = await createCategory({
  name: '工作',
  color: '#4CAF50',
  description: '工作相关的笔记',
});

// 更新分类
const updated = await updateCategory(categoryId, {
  name: '工作和学习',
  color: '#9C27B0',
});

// 删除分类
await deleteCategory(categoryId);
```

### 笔记 (Memo)

**导入**:
```typescript
import {
  getMemos,
  getMemo,
  createMemo,
  updateMemo,
  deleteMemo,
  searchMemosByVector,
  getRelatedMemos,
} from '@/api';
```

**函数**:
- `getMemos(params?)` - 获取笔记列表（支持分页、排序、搜索）
- `getMemo(memoId)` - 获取单个笔记
- `createMemo(params)` - 创建笔记
- `updateMemo(memoId, params)` - 更新笔记
- `deleteMemo(memoId)` - 删除笔记
- `searchMemosByVector(params)` - 向量搜索笔记
- `getRelatedMemos(memoId, limit?)` - 查找相关笔记

**使用示例**:
```typescript
// 获取笔记列表
const result = await getMemos({
  page: 1,
  limit: 10,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
});
console.log(result.items); // 笔记列表
console.log(result.total); // 总数
console.log(result.page);  // 当前页

// 创建笔记
const newMemo = await createMemo({
  content: '这是一个新笔记',
  categoryId: 'category_123456',
  attachments: [],
  relationIds: [],
});

// 更新笔记
const updated = await updateMemo(memoId, {
  content: '更新后的内容',
  categoryId: 'category_123456',
});

// 删除笔记
await deleteMemo(memoId);

// 向量搜索
const searchResults = await searchMemosByVector({
  query: '如何学习编程',
  page: 1,
  limit: 20,
});

// 查找相关笔记
const relatedMemos = await getRelatedMemos(memoId, 10);
```

### 附件 (Attachment)

**导入**:
```typescript
import {
  getAttachments,
  getAttachment,
  uploadAttachment,
  deleteAttachment,
  getAttachmentUrl,
} from '@/api';
```

**函数**:
- `getAttachments(params?)` - 获取附件列表
- `getAttachment(attachmentId)` - 获取单个附件信息
- `uploadAttachment(params)` - 上传附件
- `deleteAttachment(attachmentId)` - 删除附件
- `getAttachmentUrl(attachmentId)` - 获取附件下载 URL

**使用示例**:
```typescript
// 获取附件列表
const attachments = await getAttachments({
  page: 1,
  limit: 20,
});

// 上传附件
const attachment = await uploadAttachment({
  file: fileObject,
  fileName: 'document.pdf',
  createdAt: Date.now(),
});

// 删除附件
await deleteAttachment(attachmentId);

// 获取下载 URL
const url = getAttachmentUrl(attachmentId);
// 使用 url 下载或展示文件
```

### 备份 (Backup)

**导入**:
```typescript
import { getBackupStatus, forceBackup, cleanupBackups } from '@/api';
```

**函数**:
- `getBackupStatus()` - 获取备份状态
- `forceBackup()` - 立即备份
- `cleanupBackups()` - 清理过期备份

**使用示例**:
```typescript
// 获取备份状态
const status = await getBackupStatus();
console.log(status.lastBackupTime);      // 上次备份时间
console.log(status.lastBackupStatus);    // 备份状态
console.log(status.isRunning);           // 是否正在运行

// 立即备份
await forceBackup();

// 清理旧备份
await cleanupBackups();
```

## 公共工具函数

**导入**:
```typescript
import { getToken, saveToken, clearToken, createFormData } from '@/api';
```

**函数**:
- `getToken()` - 获取保存的 token
- `saveToken(token)` - 保存 token
- `clearToken()` - 清除 token
- `createFormData(file, fileName, fields?)` - 创建表单数据（文件上传用）

**使用示例**:
```typescript
// 获取 token
const token = getToken();

// 保存 token
saveToken(myToken);

// 清除 token
clearToken();

// 创建表单数据
const formData = createFormData(
  fileBlob,
  'image.jpg',
  { createdAt: Date.now() }
);
```

## 类型导入

所有类型定义都可以从 `@/api` 导入：

```typescript
import type {
  User,
  Category,
  Memo,
  Attachment,
  BackupStatus,
  // ... 其他类型
} from '@/api';
```

## 错误处理

所有 API 函数都会抛出错误，使用 try-catch 处理：

```typescript
try {
  const result = await getMemos();
} catch (error) {
  console.error('获取笔记列表失败:', error.message);
}
```

## 与 @rabjs/react 结合使用

建议在 Service 中使用这些 API 函数进行状态管理：

```typescript
import { Service } from '@rabjs/react';
import { getMemos, createMemo } from '@/api';
import type { Memo } from '@/api';

class MemoService extends Service {
  memos: Memo[] = [];
  loading = false;

  async fetchMemos() {
    this.loading = true;
    try {
      const result = await getMemos({ limit: 10 });
      this.memos = result.items;
    } finally {
      this.loading = false;
    }
  }

  async addMemo(content: string) {
    try {
      const memo = await createMemo({ content });
      this.memos.unshift(memo);
      return memo;
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  }
}

export default MemoService;
```

然后在组件中使用：

```typescript
import { useService, view } from '@rabjs/react';
import MemoService from '@/services/memo-service';

const MemoList = view(() => {
  const memoService = useService(MemoService);

  useEffect(() => {
    memoService.fetchMemos();
  }, []);

  return (
    <View>
      {memoService.loading && <Text>加载中...</Text>}
      {memoService.memos.map(memo => (
        <Text key={memo.memoId}>{memo.content}</Text>
      ))}
    </View>
  );
});
```

## 批量操作示例

### 创建带附件的笔记

```typescript
import { uploadAttachment, createMemo } from '@/api';

async function createMemoWithAttachment(content: string, file: File) {
  // 1. 上传附件
  const attachment = await uploadAttachment({
    file,
    fileName: file.name,
  });

  // 2. 创建笔记并关联附件
  const memo = await createMemo({
    content,
    attachments: [attachment.id],
  });

  return memo;
}
```

### 分页加载

```typescript
import { getMemos } from '@/api';

let currentPage = 1;
const limit = 20;

async function loadMore() {
  const result = await getMemos({
    page: currentPage,
    limit,
  });

  // 检查是否有更多数据
  if (result.page * result.limit < result.total) {
    currentPage++;
    return true; // 有更多数据
  }
  return false; // 没有更多数据
}
```

## 常见问题

### Q: 如何处理认证？
A: 登录后会自动保存 token，所有后续请求都会自动附加 token：
```typescript
await login({ email, password }); // token 自动保存
```

### Q: 如何取消认证？
A: 调用 `clearToken()` 清除 token：
```typescript
clearToken();
```

### Q: 如何在请求中使用自定义 token？
A: 直接调用 API 的内部函数（高级用法）

### Q: 是否支持离线？
A: 不支持，需要自行实现本地缓存

### Q: 文件上传有大小限制吗？
A: 有，详见 `/docs/api/attachment.md`

## 相关文档

- API 接口文档：`/docs/api/`
- TypeScript 类型：`/api/` 和 `/types/`
- @rabjs/react 规范：`.catpaw/rules/rs-react.md`
- 项目规范：`.catpaw/rules/base.md`
