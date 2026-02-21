/**
 * Category Service - 分类管理服务
 * 使用 @rabjs/react 进行响应式状态管理
 *
 * 功能：
 * - 获取分类列表
 * - 创建分类
 * - 删除分类
 * - 管理分类状态
 */

import {
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
  getCategories as apiGetCategories,
} from "@/api/category";
import type { Category, CreateCategoryRequest } from "@/types/category";
import { Service } from "@rabjs/react";

class CategoryService extends Service {
  // 响应式属性
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  /**
   * 初始化：加载分类列表
   */
  async initialize(): Promise<void> {
    await this.fetchCategories();
  }

  /**
   * 获取分类列表
   */
  async fetchCategories(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const categories = await apiGetCategories();
      this.categories = categories;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "获取分类列表失败";
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 创建分类
   * @param params - 分类信息 (name, color, description)
   */
  async createCategory(params: CreateCategoryRequest): Promise<Category> {
    this.loading = true;
    this.error = null;

    try {
      const newCategory = await apiCreateCategory(params);
      // 添加到列表
      this.categories = [...this.categories, newCategory];
      return newCategory;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "创建分类失败";
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 删除分类
   * @param categoryId - 分类 ID
   */
  async deleteCategory(categoryId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      await apiDeleteCategory(categoryId);
      // 从列表中移除
      this.categories = this.categories.filter(
        (c) => c.categoryId !== categoryId,
      );
    } catch (err) {
      this.error = err instanceof Error ? err.message : "删除分类失败";
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 清除错误信息
   */
  clearError(): void {
    this.error = null;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.categories = [];
    this.loading = false;
    this.error = null;
  }
}

export default CategoryService;
