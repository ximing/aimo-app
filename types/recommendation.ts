/**
 * Recommendation API 类型定义
 */

/**
 * 推荐类型
 */
export type RecommendationType = "daily" | "history_today";

/**
 * 推荐/历史今天项
 */
export interface RecommendationItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  type: RecommendationType;
}

/**
 * 每日推荐响应
 */
export interface DailyRecommendationsResponse {
  items: RecommendationItem[];
}

/**
 * 历史今天响应
 */
export interface HistoryTodayMemosResponse {
  items: RecommendationItem[];
}
