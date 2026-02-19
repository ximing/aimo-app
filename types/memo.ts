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
  type: 'text' | 'audio' | 'video'; // 笔记类型
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
  relevanceScore?: number;   // 相似度分数 (0-1)，越高越相关
}

export interface VectorSearchRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface VectorSearchResponse extends PaginatedResponse<MemoWithSimilarity> {}

export interface RelatedMemoItem {
  id: string;
  memoId: string;
  content: string;
  createTime: number;
  relevanceScore: number;
  similarity?: number;
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
 * 每日活动统计项
 */
export interface MemoActivityStatsItemDto {
  date: string;    // ISO 日期字符串 (YYYY-MM-DD)
  count: number;   // 该日期创建的笔记数量
}

/**
 * 活动统计响应类型
 */
export interface MemoActivityStatsDto {
  items: MemoActivityStatsItemDto[];  // 每日活动统计列表
  startDate: string;  // 统计开始日期（ISO 格式）
  endDate: string;    // 统计结束日期（ISO 格式）
}

/**
 * 历史上的今天备忘录项
 */
export interface OnThisDayMemoDto {
  memoId: string;      // 笔记唯一标识符
  content: string;    // 笔记内容
  createdAt: number;   // 创建时间戳（毫秒）
  year: number;        // 创建年份
}

/**
 * 历史上的今天响应类型
 */
export interface OnThisDayResponseDto {
  items: OnThisDayMemoDto[];  // 历史上的今天创建的笔记列表
  total: number;               // 总数量
  todayMonthDay: string;       // 当天月日（MM-DD 格式）
}
