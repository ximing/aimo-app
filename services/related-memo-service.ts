/**
 * Related Memo Service
 * 使用 @rabjs/react 进行响应式状态管理
 * 管理相关笔记的无限滚动列表状态
 */

import { Service } from '@rabjs/react';
import { getRelatedMemos as apiGetRelatedMemos } from '@/api/memo';
import type { RelatedMemoItem } from '@/types/memo';

class RelatedMemoService extends Service {
  // 相关笔记列表
  relatedMemos: RelatedMemoItem[] = [];

  // 加载状态
  loading = false;

  // 错误信息
  error: string | null = null;

  // 是否还有更多数据
  hasMore = true;

  // 当前页码
  currentPage = 1;

  // 每页数量
  pageSize = 10;

  // 当前关联的笔记ID
  currentMemoId: string | null = null;

  /**
   * 加载相关笔记列表
   * 自动处理分页，首次调用加载第一页，后续调用加载下一页
   * @param memoId - 笔记ID
   * @returns Promise<void>
   */
  async loadRelatedMemos(memoId: string): Promise<void> {
    // 如果切换了笔记，重置状态
    if (this.currentMemoId !== memoId) {
      this.reset();
      this.currentMemoId = memoId;
    }

    // 如果没有更多数据或正在加载，直接返回
    if (!this.hasMore || this.loading) return;

    this.loading = true;
    this.error = null;

    try {
      const response = await apiGetRelatedMemos(
        memoId,
        this.currentPage,
        this.pageSize
      );

      // 追加新数据到列表（去重）
      const existingIds = new Set(this.relatedMemos.map((m) => m.id));
      const newItems = response.items.filter((item) => !existingIds.has(item.id));
      this.relatedMemos.push(...newItems);

      // 更新分页状态
      const { pagination } = response;
      this.hasMore = this.currentPage < pagination.totalPages;
      this.currentPage += 1;
    } catch (err) {
      this.error = err instanceof Error ? err.message : '获取相关笔记失败';
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 刷新相关笔记列表
   * 重置状态并重新加载第一页
   * @param memoId - 笔记ID
   * @returns Promise<void>
   */
  async refreshRelatedMemos(memoId: string): Promise<void> {
    this.reset();
    this.currentMemoId = memoId;
    await this.loadRelatedMemos(memoId);
  }

  /**
   * 重置所有状态
   * 用于切换笔记时清空数据
   */
  reset(): void {
    this.relatedMemos = [];
    this.loading = false;
    this.error = null;
    this.hasMore = true;
    this.currentPage = 1;
    this.currentMemoId = null;
  }

  /**
   * 清除错误信息
   */
  clearError(): void {
    this.error = null;
  }
}

export default RelatedMemoService;
