/**
 * Memo API 类型定义
 * 对应文档: /docs/api/memo.md
 */

import type { PaginatedResponse } from "@/types/common";

/**
 * 附件数据传输对象
 */
export interface AttachmentDto {
  attachmentId: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  createdAt: number;
  /** 附件属性：audio(duration), image(width,height), video(duration) */
  properties?: Record<string, unknown>;
}

/**
 * 备忘录列表项数据传输对象
 */
export interface MemoListItemDto {
  memoId: string;
  uid: string;
  content: string;
  type: "text" | "audio" | "video"; // 笔记类型
  categoryId?: string;
  attachments?: AttachmentDto[];
  relations?: MemoListItemDto[];
  createdAt: number;
  updatedAt: number;
}

/**
 * 备忘录数据模型（等同于 MemoListItemDto）
 */
export interface Memo extends MemoListItemDto {}

/**
 * 备忘录类型
 */
export type MemoType = "text" | "audio" | "video";

/**
 * 创建备忘录请求
 * 注: attachments 和 relations 字段仅接受 ID
 */
export interface CreateMemoRequest {
  content: string;
  type?: MemoType;
  categoryId?: string;
  attachments?: string[];
  relations?: string[];
  createdAt?: number;
  updatedAt?: number;
}

/**
 * 更新备忘录请求
 * 注: attachments 和 relations 字段仅接受 ID
 */
export interface UpdateMemoRequest {
  content: string;
  categoryId?: string;
  attachments?: string[];
  relations?: string[];
}

export interface ListMemosParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MemoListResponse extends PaginatedResponse<Memo> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MemoResponse {
  message: string;
  memo: Memo;
}

export interface MemoWithSimilarity extends Memo {
  relevanceScore?: number; // 相似度分数 (0-1)，越高越相关
}

export interface VectorSearchRequest {
  query: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  startDate?: number;
  endDate?: number;
}

export interface VectorSearchResponse extends PaginatedResponse<MemoWithSimilarity> {}

export interface RelatedMemoItem {
  id: string;
  uid: string;
  memoId: string;
  content: string;
  type: string;
  createdAt: number;
  updatedAt: number;
  relevanceScore: number;
  similarity?: number;
  attachments?: unknown[];
  categoryId?: string | null;
}

export interface RelatedMemosResponse {
  items: RelatedMemoItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 反向链接响应类型
 */
export interface BacklinksResponse {
  items: MemoListItemDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 搜索备忘录参数
 */
export interface SearchMemosParams {
  keyword: string; // 搜索关键词（必填）
  categoryId?: string; // 分类ID（undefined表示全部分类）
  dateRange?: {
    // 日期范围
    start: Date;
    end: Date;
  };
  page?: number; // 页码，从1开始
  pageSize?: number; // 每页数量
}

/**
 * 搜索结果项（复用 Memo 类型）
 */
export type SearchResultItem = Memo;

/**
 * 搜索响应类型
 */
export interface SearchMemosResponse extends PaginatedResponse<SearchResultItem> {}
