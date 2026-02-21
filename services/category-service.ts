/**
 * Category Service - 分类状态管理服务
 *
 * 管理分类列表，支持从 API 获取分类数据
 */

import { Service } from '@rabjs/react';
import { getCategories } from '@/api/category';
import type { Category } from '@/types/category';

class CategoryService extends Service {
  // 分类列表
  categories: Category[] = [];
  // 加载状态
  loading = false;
  // 错误信息
  error: string | null = null;
  // 是否已初始化
  initialized = false;

  /**
   * 初始化：获取分类列表
   */
  async initialize(): Promise<void> {
    if (this.initialized && this.categories.length > 0) {
      return;
    }
    await this.fetchCategories();
  }

  /**
   * 获取分类列表
   */
  async fetchCategories(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const categories = await getCategories();
      this.categories = categories;
      this.initialized = true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : '获取分类列表失败';
      console.error('Failed to fetch categories:', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * 根据 ID 获取分类
   */
  getCategoryById(categoryId: string): Category | undefined {
    return this.categories.find(c => c.categoryId === categoryId);
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
    this.initialized = false;
  }
}

export default CategoryService;
