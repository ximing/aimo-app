/**
 * Memo Service
 * 使用 @rabjs/react 进行响应式状态管理
 */

import { Service } from '@rabjs/react';
import { getMemos as apiGetMemos } from '@/api/memo';
import type { Memo, ListMemosParams } from '@/types/memo';

class MemoService extends Service {
  // 响应式属性
  memos: Memo[] = [];
  loading = false;
  error: string | null = null;
  hasMore = true;
  currentPage = 1;
  pageSize = 20;

  /**
   * 获取 memo 列表
   */
  async fetchMemos(params?: ListMemosParams): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const response = await apiGetMemos({
        page: params?.page || this.currentPage,
        limit: params?.limit || this.pageSize,
        ...params,
      });

      if (params?.page && params.page > 1) {
        // 加载更多
        this.memos.push(...response.items);
      } else {
        // 首次加载或刷新
        this.memos = response.items;
        this.currentPage = 1;
      }

      this.hasMore = response.items.length === this.pageSize;
      this.currentPage = (params?.page || this.currentPage) + 1;
    } catch (err) {
      this.error = err instanceof Error ? err.message : '获取 memo 列表失败';
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 刷新列表
   */
  async refreshMemos(): Promise<void> {
    this.currentPage = 1;
    this.hasMore = true;
    await this.fetchMemos({ page: 1, limit: this.pageSize });
  }

  /**
   * 加载下一页
   */
  async loadNextPage(): Promise<void> {
    if (!this.hasMore || this.loading) return;

    await this.fetchMemos({ page: this.currentPage, limit: this.pageSize });
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
    this.memos = [];
    this.loading = false;
    this.error = null;
    this.hasMore = true;
    this.currentPage = 1;
  }
}

export default MemoService;
