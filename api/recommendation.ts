/**
 * Recommendation API - 每日推荐相关接口
 */

import type {
  DailyRecommendationsResponse,
  HistoryTodayMemosResponse,
  RecommendationItem,
} from "@/types/recommendation";
import { apiGet } from "./common";

/**
 * 获取每日推荐
 * GET /recommendation/daily
 */
export const getDailyRecommendations = async (): Promise<RecommendationItem[]> => {
  const response = await apiGet<DailyRecommendationsResponse>("/recommendation/daily");

  if (response.code !== 0) {
    throw new Error(response.msg || "获取每日推荐失败");
  }

  return response.data.items;
};

/**
 * 获取历史的今天备忘录
 * GET /recommendation/history-today
 */
export const getHistoryTodayMemos = async (): Promise<RecommendationItem[]> => {
  const response = await apiGet<HistoryTodayMemosResponse>("/recommendation/history-today");

  if (response.code !== 0) {
    throw new Error(response.msg || "获取历史今天备忘录失败");
  }

  return response.data.items;
};
