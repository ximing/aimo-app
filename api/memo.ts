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
  BacklinksResponse,
  MemoActivityStatsDto,
  OnThisDayResponseDto,
  SearchMemosParams,
  SearchMemosResponse,
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
 * @param memoId - 笔记ID
 * @param page - 页码，从1开始
 * @param pageSize - 每页数量
 * @returns Promise<RelatedMemosResponse>
 * @throws Error 当API请求失败时抛出异常
 */
export const getRelatedMemos = async (
  memoId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<RelatedMemosResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  queryParams.append('limit', String(pageSize));

  const url = `/memos/${memoId}/related?${queryParams.toString()}`;
  const response = await apiGet<RelatedMemosResponse>(url);

  if (response.code !== 0) {
    throw new Error(response.message || '获取相关笔记失败');
  }

  return response.data;
};

/**
 * 获取反向链接
 * GET /api/v1/memos/:memoId/backlinks
 */
export const getBacklinks = async (
  memoId: string,
  page?: number,
  limit?: number
): Promise<BacklinksResponse> => {
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', String(page));
  if (limit) queryParams.append('limit', String(limit));

  const queryString = queryParams.toString();
  const url = `/memos/${memoId}/backlinks${queryString ? `?${queryString}` : ''}`;

  const response = await apiGet<BacklinksResponse>(url);

  if (response.code !== 0) {
    throw new Error(response.message || '获取反向链接失败');
  }

  return response.data;
};

/**
 * 获取活动统计
 * GET /api/v1/memos/stats/activity
 */
export const getActivityStats = async (
  days?: number
): Promise<MemoActivityStatsDto> => {
  const url = days ? `/memos/stats/activity?days=${days}` : '/memos/stats/activity';
  const response = await apiGet<MemoActivityStatsDto>(url);

  if (response.code !== 0) {
    throw new Error(response.message || '获取活动统计失败');
  }

  return response.data;
};

/**
 * 获取历史上的今天
 * GET /api/v1/memos/on-this-day
 */
export const getOnThisDayMemos = async (): Promise<OnThisDayResponseDto> => {
  const response = await apiGet<OnThisDayResponseDto>('/memos/on-this-day');

  if (response.code !== 0) {
    throw new Error(response.message || '获取历史上的今天失败');
  }

  return response.data;
};

/**
 * 搜索笔记
 * POST /api/v1/memos/search
 * @param params - 搜索参数
 * @returns Promise<SearchMemosResponse> - 搜索结果列表和总数量
 * @throws Error 当API请求失败时抛出异常
 */
export const searchMemos = async (
  params: SearchMemosParams
): Promise<SearchMemosResponse> => {
  const queryParams = new URLSearchParams();

  // 分页参数
  queryParams.append('page', String(params.page || 1));
  queryParams.append('limit', String(params.pageSize || 20));

  // 构建请求体
  const body: Record<string, unknown> = {
    keyword: params.keyword,
  };

  // 可选参数
  if (params.categoryId) {
    body.categoryId = params.categoryId;
  }

  if (params.dateRange) {
    body.startDate = params.dateRange.start.toISOString();
    body.endDate = params.dateRange.end.toISOString();
  }

  const url = `/memos/search?${queryParams.toString()}`;
  const response = await apiPost<SearchMemosResponse>(url, body);

  if (response.code !== 0) {
    throw new Error(response.message || '搜索笔记失败');
  }

  return response.data;
};
