/**
 * Category API - 分类相关接口
 * 文档: /docs/api/category.md
 */

import { apiGet, apiPost, apiPut, apiDelete } from './common';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoriesListResponse,
  CategoryResponse,
} from '@/types/category';

/**
 * 获取所有分类
 * GET /api/v1/categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiGet<CategoriesListResponse>('/categories');

  if (response.code !== 0) {
    throw new Error(response.message || '获取分类列表失败');
  }

  return response.data.categories;
};

/**
 * 获取单个分类
 * GET /api/v1/categories/:categoryId
 */
export const getCategory = async (categoryId: string): Promise<Category> => {
  const response = await apiGet<CategoryResponse>(`/categories/${categoryId}`);

  if (response.code !== 0) {
    throw new Error(response.message || '获取分类失败');
  }

  return response.data.category;
};

/**
 * 创建分类
 * POST /api/v1/categories
 */
export const createCategory = async (
  params: CreateCategoryRequest
): Promise<Category> => {
  const response = await apiPost<CategoryResponse>('/categories', params);

  if (response.code !== 0) {
    throw new Error(response.message || '创建分类失败');
  }

  return response.data.category;
};

/**
 * 更新分类
 * PUT /api/v1/categories/:categoryId
 */
export const updateCategory = async (
  categoryId: string,
  params: UpdateCategoryRequest
): Promise<Category> => {
  const response = await apiPut<CategoryResponse>(
    `/categories/${categoryId}`,
    params
  );

  if (response.code !== 0) {
    throw new Error(response.message || '更新分类失败');
  }

  return response.data.category;
};

/**
 * 删除分类
 * DELETE /api/v1/categories/:categoryId
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  const response = await apiDelete<{ message: string }>(`/categories/${categoryId}`);

  if (response.code !== 0) {
    throw new Error(response.message || '删除分类失败');
  }
};
