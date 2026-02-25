/**
 * Tag API - 标签相关接口
 * 文档: /docs/api/tag.md
 */

import type {
    CreateTagRequest,
    TagDto,
    TagResponse,
    TagsListResponse,
    UpdateTagRequest,
} from "@/types/tag";
import { apiDelete, apiGet, apiPost, apiPut } from "./common";

/**
 * 获取标签列表
 * GET /api/v1/tags
 */
export const getTags = async (): Promise<TagDto[]> => {
  const response = await apiGet<TagsListResponse>("/tags");

  if (response.code !== 0) {
    throw new Error(response.msg || "获取标签列表失败");
  }

  return response.data.tags;
};

/**
 * 获取单个标签
 * GET /api/v1/tags/:tagId
 */
export const getTag = async (tagId: string): Promise<TagDto> => {
  const response = await apiGet<TagResponse>(`/tags/${tagId}`);

  if (response.code !== 0) {
    throw new Error(response.msg || "获取标签失败");
  }

  return response.data.tag;
};

/**
 * 创建标签
 * POST /api/v1/tags
 */
export const createTag = async (params: CreateTagRequest): Promise<TagDto> => {
  const response = await apiPost<TagResponse>("/tags", params);

  if (response.code !== 0) {
    throw new Error(response.msg || "创建标签失败");
  }

  return response.data.tag;
};

/**
 * 更新标签
 * PUT /api/v1/tags/:tagId
 */
export const updateTag = async (
  tagId: string,
  params: UpdateTagRequest,
): Promise<TagDto> => {
  const response = await apiPut<TagResponse>(`/tags/${tagId}`, params);

  if (response.code !== 0) {
    throw new Error(response.msg || "更新标签失败");
  }

  return response.data.tag;
};

/**
 * 删除标签
 * DELETE /api/v1/tags/:tagId
 */
export const deleteTag = async (tagId: string): Promise<void> => {
  const response = await apiDelete<{ message: string }>(`/tags/${tagId}`);

  if (response.code !== 0) {
    throw new Error(response.msg || "删除标签失败");
  }
};
