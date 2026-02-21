/**
 * Memo Service
 * 使用 @rabjs/react 进行响应式状态管理
 */

import { getActivityStats as apiGetActivityStats } from "@/api/insights";
import {
  deleteMemo as apiDeleteMemo,
  getMemo as apiGetMemo,
  getMemos as apiGetMemos,
  getRelatedMemos as apiGetRelatedMemos,
} from "@/api/memo";
import type { MemoActivityStatsDto } from "@/types/insights";
import type { ListMemosParams, Memo, RelatedMemoItem } from "@/types/memo";
import { Service, resolve } from "@rabjs/react";
import FilterService, {
  type SortField,
  type SortOrder,
} from "./filter-service";

class MemoService extends Service {
  // FilterService 实例（通过依赖注入获取）
  private get filterService() {
    return resolve(FilterService);
  }

  // 响应式属性
  memos: Memo[] = [];
  loading = false;
  error: string | null = null;
  hasMore = true;
  currentPage = 1;
  pageSize = 20;

  // 筛选相关属性（从 FilterService 同步）
  categoryFilter: string | undefined = undefined;
  sortField: SortField = "createdAt";
  sortOrder: SortOrder = "desc";

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
      console.log("filterParams", filterParams);
      const response = await apiGetMemos({
        page,
        limit,
        ...filterParams,
        ...params,
      });

      if (page > 1) {
        // 加载更多
        this.memos = [...this.memos, ...response.items];
      } else {
        // 首次加载或刷新
        this.memos = response.items;
      }
      console.log("response", response.pagination);
      const pagination = response.pagination;
      this.hasMore = this.currentPage < (pagination?.totalPages || 1);
      this.currentPage = this.currentPage + 1;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "获取 memo 列表失败";
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
   * 加载下一页
   */
  async loadNextPage(): Promise<void> {
    console.log("this.hasMore", this.hasMore);
    if (!this.hasMore || this.loading) return;

    await this.fetchMemos({ page: this.currentPage, limit: this.pageSize });
  }

  /**
   * 删除 memo
   */
  async deleteMemo(memoId: string): Promise<void> {
    try {
      await apiDeleteMemo(memoId);
      // 从列表中删除
      this.memos = this.memos.filter((memo) => memo.memoId !== memoId);
    } catch (err) {
      this.error = err instanceof Error ? err.message : "删除 memo 失败";
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
        apiGetRelatedMemos(memoId, 1, 10),
      ]);

      this.currentMemo = memo;
      this.relatedMemos = relatedData.items;
    } catch (err) {
      this.detailError =
        err instanceof Error ? err.message : "获取 memo 详情失败";
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
      this.activityStatsError =
        err instanceof Error ? err.message : "获取活动统计失败";
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
