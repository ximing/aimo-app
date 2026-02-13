/**
 * Memo API - 笔记相关接口
 * 文档: /docs/api/memo.md
 */

import { apiGet, apiPost, apiPut, apiDelete } from './common';
import type {
  Memo,
  CreateMemoRequest,
  UpdateMemoRequest,
  ListMemosParams,
  MemoListResponse,
  MemoResponse,
  VectorSearchRequest,
  VectorSearchResponse,
  RelatedMemosResponse,
} from '@/types/memo';

/**
 * 获取笔记列表
 * GET /api/v1/memos
 */
export const getMemos = async (params?: ListMemosParams): Promise<MemoListResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = queryString ? `/memos?${queryString}` : '/memos';

  const response = await apiGet<MemoListResponse>(url);

  if (response.code !== 0) {
    throw new Error(response.message || '获取笔记列表失败');
  }

  return response.data;
};

/**
 * 获取单个笔记
 * GET /api/v1/memos/:memoId
 */
export const getMemo = async (memoId: string): Promise<Memo> => {
  const response = await apiGet<Memo>(`/memos/${memoId}`);

  if (response.code !== 0) {
    throw new Error(response.message || '获取笔记失败');
  }

  return response.data;
};

/**
 * 创建笔记
 * POST /api/v1/memos
 */
export const createMemo = async (params: CreateMemoRequest): Promise<Memo> => {
  const response = await apiPost<MemoResponse>('/memos', params);

  if (response.code !== 0) {
    throw new Error(response.message || '创建笔记失败');
  }

  return response.data.memo;
};

/**
 * 更新笔记
 * PUT /api/v1/memos/:memoId
 */
export const updateMemo = async (
  memoId: string,
  params: UpdateMemoRequest
): Promise<Memo> => {
  const response = await apiPut<MemoResponse>(`/memos/${memoId}`, params);

  if (response.code !== 0) {
    throw new Error(response.message || '更新笔记失败');
  }

  return response.data.memo;
};

/**
 * 删除笔记
 * DELETE /api/v1/memos/:memoId
 */
export const deleteMemo = async (memoId: string): Promise<void> => {
  const response = await apiDelete<{ message: string }>(`/memos/${memoId}`);

  if (response.code !== 0) {
    throw new Error(response.message || '删除笔记失败');
  }
};

/**
 * 向量搜索笔记
 * POST /api/v1/memos/search/vector
 */
export const searchMemosByVector = async (
  params: VectorSearchRequest
): Promise<VectorSearchResponse> => {
  const response = await apiPost<VectorSearchResponse>('/memos/search/vector', {
    query: params.query,
    page: params.page || 1,
    limit: params.limit || 20,
  });

  if (response.code !== 0) {
    throw new Error(response.message || '向量搜索失败');
  }

  return response.data;
};

/**
 * 查找相关笔记
 * GET /api/v1/memos/:memoId/related
 */
export const getRelatedMemos = async (
  memoId: string,
  limit?: number
): Promise<RelatedMemosResponse> => {
  const url = `/memos/${memoId}/related${limit ? `?limit=${limit}` : ''}`;
  const response = await apiGet<RelatedMemosResponse>(url);

  if (response.code !== 0) {
    throw new Error(response.message || '获取相关笔记失败');
  }

  return response.data;
};
