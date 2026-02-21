/**
 * Memo Service
 * 使用 @rabjs/react 进行响应式状态管理
 */

import { Service, ioc } from '@rabjs/react';
import {
  getMemos as apiGetMemos,
  deleteMemo as apiDeleteMemo,
  getMemo as apiGetMemo,
  getRelatedMemos as apiGetRelatedMemos,
  getActivityStats as apiGetActivityStats
} from '@/api/memo';
import type {
  Memo,
  MemoListResponse,
  ListMemosParams,
  RelatedMemoItem,
  MemoActivityStatsDto
} from '@/types/memo';
import FilterService, { type SortField, type SortOrder } from './filter-service';

class MemoService extends Service {
  // FilterService 实例（通过依赖注入获取）
  private filterService = ioc(FilterService);

  // 响应式属性
  memos: Memo[] = [];
  loading = false;
  error: string | null = null;
  hasMore = true;
  currentPage = 1;
  pageSize = 20;

  // 筛选相关属性（从 FilterService 同步）
  categoryFilter: string | undefined = undefined;
  sortField: SortField = 'createdAt';
  sortOrder: SortOrder = 'desc';

  // 搜索相关属性
  searchQuery = "";
  searchLoading = false;
  searchPage = 1;
  
  // 详情页相关属性
  currentMemo: Memo | null = null;
  relatedMemos: RelatedMemoItem[] = [];
  detailLoading = false;
  detailError: string | null = null;

  // 活动统计相关属性
  activityStats: MemoActivityStatsDto | null = null;
  activityStatsLoading = false;
  activityStatsError: string | null = null;

  /**
   * 从 FilterService 同步筛选状态
   */
  private syncFilterState(): void {
    this.categoryFilter = this.filterService.selectedCategoryId;
    this.sortField = this.filterService.sortField;
    this.sortOrder = this.filterService.sortOrder;
  }

  /**
   * 获取当前的筛选参数
   */
  private getFilterParams(): Partial<ListMemosParams> {
    return {
      categoryId: this.categoryFilter,
      sortBy: this.sortField,
      sortOrder: this.sortOrder,
    };
  }

  /**
   * 监听 FilterService 变化并自动刷新列表
   */
  watchFilterChanges(): () => void {
    // 初始同步
    this.syncFilterState();

    // 监听 FilterService 的状态变化
    const dispose = this.filterService.$reactive(() => {
      const prevCategory = this.categoryFilter;
      const prevSortField = this.sortField;
      const prevSortOrder = this.sortOrder;

      // 同步最新状态
      this.syncFilterState();

      // 如果筛选条件发生变化，自动刷新列表
      if (
        prevCategory !== this.categoryFilter ||
        prevSortField !== this.sortField ||
        prevSortOrder !== this.sortOrder
      ) {
        this.refreshMemos();
      }
    });

    return dispose;
  }

  private resolvePagination(
    response: MemoListResponse,
    fallbackPage: number,
    fallbackLimit: number
  ): { hasMore: boolean; nextPage: number; pageSize: number } {
    const pagination = (response as {
      pagination?: { page?: number; limit?: number; totalPages?: number };
    }).pagination;
    const page = pagination?.page ?? (response as { page?: number }).page ?? fallbackPage;
    const limit =
      pagination?.limit ?? (response as { limit?: number }).limit ?? fallbackLimit;
    const totalPages =
      pagination?.totalPages ?? (response as { totalPages?: number }).totalPages;
    const hasMore =
      typeof totalPages === 'number'
        ? page < totalPages
        : response.items.length === limit;

    return {
      hasMore,
      nextPage: page + 1,
      pageSize: limit,
    };
  }

  /**
   * 获取 memo 列表
   */
  async fetchMemos(params?: ListMemosParams): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const page = params?.page ?? this.currentPage;
      const limit = params?.limit ?? this.pageSize;

      // 合并筛选和排序参数
      const filterParams = this.getFilterParams();
      const response = await apiGetMemos({
        page,
        limit,
        ...filterParams,
        ...params,
      });

      if (page > 1) {
        // 加载更多
        this.memos.push(...response.items);
      } else {
        // 首次加载或刷新
        this.memos = response.items;
      }

      const paginationState = this.resolvePagination(response, page, limit);
      this.hasMore = paginationState.hasMore;
      this.pageSize = paginationState.pageSize;
      this.currentPage = paginationState.nextPage;
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
    // 同步最新筛选状态
    this.syncFilterState();
    await this.fetchMemos({ page: 1, limit: this.pageSize });
  }

  /**
   * 搜索笔记
   * @param query - 搜索关键词
   */
  async searchMemos(query: string): Promise<void> {
    this.searchQuery = query;
    this.searchPage = 1;
    this.hasMore = true;
    this.loading = true;
    this.error = null;

    try {
      const response = await apiGetMemos({
        page: 1,
        limit: this.pageSize,
        search: query || undefined,
      });

      this.memos = response.items;
      const paginationState = this.resolvePagination(response, 1, this.pageSize);
      this.hasMore = paginationState.hasMore;
      this.searchPage = paginationState.nextPage;
    } catch (err) {
      this.error = err instanceof Error ? err.message : '搜索失败';
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 搜索分页加载更多
   */
  async loadNextSearchPage(): Promise<void> {
    if (!this.hasMore || this.loading || !this.searchQuery) return;

    this.loading = true;
    this.error = null;

    try {
      const page = this.searchPage;
      const response = await apiGetMemos({
        page,
        limit: this.pageSize,
        search: this.searchQuery || undefined,
      });

      // searchPage > 1 时是追加数据，searchPage === 1 时是替换
      if (page > 1) {
        this.memos.push(...response.items);
      } else {
        this.memos = response.items;
      }

      const paginationState = this.resolvePagination(
        response,
        page,
        this.pageSize
      );
      this.hasMore = paginationState.hasMore;
      this.searchPage = paginationState.nextPage;
    } catch (err) {
      this.error = err instanceof Error ? err.message : '加载更多失败';
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 清除搜索，恢复正常列表
   */
  async clearSearch(): Promise<void> {
    this.searchQuery = "";
    this.searchPage = 1;
    await this.refreshMemos();
  }

  /**
   * 加载下一页
   */
  async loadNextPage(): Promise<void> {
    if (!this.hasMore || this.loading) return;

    // 如果有搜索词，使用搜索分页
    if (this.searchQuery) {
      await this.loadNextSearchPage();
    } else {
      await this.fetchMemos({ page: this.currentPage, limit: this.pageSize });
    }
  }

  /**
   * 删除 memo
   */
  async deleteMemo(memoId: string): Promise<void> {
    try {
      await apiDeleteMemo(memoId);
      // 从列表中删除
      this.memos = this.memos.filter(memo => memo.memoId !== memoId);
    } catch (err) {
      this.error = err instanceof Error ? err.message : '删除 memo 失败';
      throw err;
    }
  }

  /**
   * 获取 memo 详情及相关笔记
   */
  async fetchMemoDetail(memoId: string): Promise<void> {
    this.detailLoading = true;
    this.detailError = null;

    try {
      const [memo, relatedData] = await Promise.all([
        apiGetMemo(memoId),
        apiGetRelatedMemos(memoId, 1, 10)
      ]);

      this.currentMemo = memo;
      this.relatedMemos = relatedData.items;
    } catch (err) {
      this.detailError = err instanceof Error ? err.message : '获取 memo 详情失败';
      throw err;
    } finally {
      this.detailLoading = false;
    }
  }

  /**
   * 清除详情页状态
   */
  clearDetail(): void {
    this.currentMemo = null;
    this.relatedMemos = [];
    this.detailError = null;
  }

  /**
   * 获取活动统计（用于热力图）
   */
  async fetchActivityStats(days: number = 90): Promise<void> {
    this.activityStatsLoading = true;
    this.activityStatsError = null;

    try {
      const stats = await apiGetActivityStats(days);
      this.activityStats = stats;
    } catch (err) {
      this.activityStatsError = err instanceof Error ? err.message : '获取活动统计失败';
    } finally {
      this.activityStatsLoading = false;
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
    this.memos = [];
    this.loading = false;
    this.error = null;
    this.hasMore = true;
    this.currentPage = 1;
    this.searchQuery = "";
    this.searchPage = 1;
    this.clearDetail();
  }

  /**
   * 应用筛选并刷新列表
   * 由 FilterService 变化触发时调用
   */
  async applyFilterAndRefresh(): Promise<void> {
    this.syncFilterState();
    await this.refreshMemos();
  }
}

export default MemoService;
