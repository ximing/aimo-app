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
}

/**
 * 备忘录列表项数据传输对象
 */
export interface MemoListItemDto {
  memoId: string;
  uid: string;
  content: string;
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
 * 创建备忘录请求
 * 注: attachments 和 relations 字段仅接受 ID
 */
export interface CreateMemoRequest {
  content: string;
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

export interface MemoListResponse extends PaginatedResponse<Memo> {}

export interface MemoResponse {
  message: string;
  memo: Memo;
}

export interface MemoWithSimilarity extends Memo {
  similarity: number;
}

export interface VectorSearchRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface VectorSearchResponse extends PaginatedResponse<MemoWithSimilarity> {}

export interface RelatedMemosResponse {
  items: MemoWithSimilarity[];
  count: number;
}
