/**
 * Detail Service
 * 详情页相关的状态管理，与 [id].tsx 组件生命周期绑定
 */

import {
    deleteMemo as apiDeleteMemo,
    getMemo as apiGetMemo,
    getRelatedMemos as apiGetRelatedMemos,
} from "@/api/memo";
import type { Memo, RelatedMemoItem } from "@/types/memo";
import { Service, resolve } from "@rabjs/react";
import MemoService from "./memo-service";

class DetailService extends Service {
  // 详情页相关属性
  currentMemo: Memo | null = null;
  relatedMemos: RelatedMemoItem[] = [];
  detailLoading = false;
  detailError: string | null = null;

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
   * 删除 memo，同步更新全局 MemoService 列表
   */
  async deleteMemo(memoId: string): Promise<void> {
    await apiDeleteMemo(memoId);
    // 同步从全局 MemoService 列表中移除
    const memoService = resolve(MemoService);
    memoService.memos = memoService.memos.filter((m) => m.memoId !== memoId);
  }

  /**
   * 清除详情页状态
   */
  clearDetail(): void {
    this.currentMemo = null;
    this.relatedMemos = [];
    this.detailError = null;
  }
}

export default DetailService;
