/**
 * API 入口索引
 * 统一导出所有 API 相关的函数
 */

// 公共工具
export {
  getToken,
  getTokenAsync,
  saveToken,
  saveTokenAsync,
  clearToken,
  clearTokenAsync,
  onUnauthorized,
  BASE_URL,
  apiRequest,
  createFormData,
} from './common';

// 认证 API
export * from './auth';

// 用户 API
export * from './user';

// 分类 API
export * from './category';

// 笔记 API
export * from './memo';

// 附件 API
export * from './attachment';

// 备份 API
export * from './backup';

// 类型导出
export type * from '@/types/common';
export type * from '@/types/auth';
export type * from '@/types/user';
export type * from '@/types/category';
export type * from '@/types/memo';
export type * from '@/types/attachment';
export type * from '@/types/backup';
