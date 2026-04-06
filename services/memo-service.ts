/**
 * Memo Service
 * 使用 @rabjs/react 进行响应式状态管理
 */

import { getActivityStats as apiGetActivityStats } from "@/api/insights";
import {
  deleteMemo as apiDeleteMemo,
  getMemos as apiGetMemos,
  updateMemo as apiUpdateMemo,
} from "@/api/memo";
import type { MemoActivityStatsDto } from "@/types/insights";
import type { ListMemosParams, Memo } from "@/types/memo";
import { Service, resolve } from "@rabjs/react";
import FilterService, {
  type SortField,
  type SortOrder,
} from "./filter-service";
import TagService from "./tag-service";

class MemoService extends Service {
  // FilterService 实例（通过依赖注入获取）
  private get filterService() {
    return resolve(FilterService);
  }

  // TagService 实例（通过依赖注入获取）
  private get tagService() {
    return resolve(TagService);
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
  tagsFilter: string = "";
  sortField: SortField = "createdAt";
  sortOrder: SortOrder = "desc";

  // 活动统计相关属性
  activityStats: MemoActivityStatsDto | null = null;
  activityStatsLoading = false;
  activityStatsError: string | null = null;

  /**
   * 从 FilterService 同步筛选状态
   * 注意：tags 参数需要标签名称（逗号分隔），而不是标签 ID
   */
  private syncFilterState(): void {
    this.categoryFilter = this.filterService.selectedCategoryId;

    // 将选中的 tagId 转换为 tag name
    const selectedTagIds = this.filterService.selectedTags;
    const tagNames = selectedTagIds
      .map((tagId) => {
        const tag = this.tagService.tags.find((t) => t.tagId === tagId);
        return tag?.name;
      })
      .filter((name): name is string => !!name)
      .join(",");

    this.tagsFilter = tagNames;
    this.sortField = this.filterService.sortField;
    this.sortOrder = this.filterService.sortOrder;
  }

  /**
   * 获取当前的筛选参数
   */
  private getFilterParams(): Partial<ListMemosParams> {
    return {
      categoryId: this.categoryFilter,
      tags: this.tagsFilter || undefined,
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
   * 更新 memo 公开状态
   */
  async updateMemoVisibility(memoId: string, isPublic: boolean): Promise<void> {
    try {
      // Find the existing memo to get its content (backend requires content field)
      const existingMemo = this.memos.find((m) => m.memoId === memoId);
      if (!existingMemo) {
        throw new Error("Memo not found");
      }

      const updatedMemo = await apiUpdateMemo(memoId, {
        content: existingMemo.content,
        isPublic,
      });
      // 更新列表中的 memo
      const index = this.memos.findIndex((m) => m.memoId === memoId);
      if (index !== -1) {
        this.memos[index] = updatedMemo;
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : "更新公开状态失败";
      throw err;
    }
  }

  /**
   * 更新 memo 分类
   */
  async updateMemoCategory(
    memoId: string,
    categoryId: string | null,
  ): Promise<void> {
    try {
      const updatedMemo = await apiUpdateMemo(memoId, {
        categoryId: categoryId || undefined,
      });
      // 更新列表中的 memo
      const index = this.memos.findIndex((m) => m.memoId === memoId);
      if (index !== -1) {
        this.memos[index] = updatedMemo;
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : "更新分类失败";
      throw err;
    }
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
