/**
 * Memo API 类型定义
 * 对应文档: /docs/api/memo.md
 */

import type { PaginatedResponse } from '@/types/common';

export interface Memo {
  memoId: string;
  uid: string;
  title?: string;
  content: string;
  categoryId?: string;
  attachments: string[];
  relationIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateMemoRequest {
  content: string;
  title?: string;
  categoryId?: string;
  attachments?: string[];
  relationIds?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface UpdateMemoRequest {
  content: string;
  categoryId?: string;
  attachments?: string[];
  relationIds?: string[];
}

export interface ListMemosParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
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
