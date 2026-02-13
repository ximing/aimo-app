/**
 * Category API 类型定义
 * 对应文档: /docs/api/category.md
 */

import type { PaginatedResponse } from '@/types/common';

export interface Category {
  categoryId: string;
  uid: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  description?: string;
}

export interface CategoriesListResponse {
  message: string;
  categories: Category[];
}

export interface CategoryResponse {
  message: string;
  category: Category;
}
