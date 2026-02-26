/**
 * Recommendation Service
 * 使用 @rabjs/react 进行响应式状态管理
 */

import type { RecommendationItem } from "@/types/recommendation";
import {
  getDailyRecommendations,
  getHistoryTodayMemos,
} from "@/api/recommendation";
import { Service } from "@rabjs/react";

class RecommendationService extends Service {
  // 响应式属性
  recommendations: RecommendationItem[] = [];
  historyToday: RecommendationItem[] = [];
  loading = false;
  error: string | null = null;

  /**
   * 获取推荐数据（每日推荐 + 历史的今天）
   */
  async fetchRecommendations(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // 并行获取两个接口
      const [recommendations, historyToday] = await Promise.all([
        getDailyRecommendations(),
        getHistoryTodayMemos(),
      ]);

      this.recommendations = recommendations;
      this.historyToday = historyToday;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "获取推荐数据失败";
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
    this.recommendations = [];
    this.historyToday = [];
    this.loading = false;
    this.error = null;
  }

  /**
   * 检查是否有推荐数据
   */
  get hasData(): boolean {
    return this.recommendations.length > 0 || this.historyToday.length > 0;
  }

  /**
   * 获取合并后的所有推荐项
   */
  get allItems(): RecommendationItem[] {
    return [...this.recommendations, ...this.historyToday];
  }
}

export default RecommendationService;
