/**
 * Insights API - 统计与推荐接口
 * 文档: /docs/api/insights.md
 */

import type {
    DailyRecommendationsResponseDto,
    MemoActivityStatsDto,
    OnThisDayResponseDto,
} from "@/types/insights";
import { apiGet } from "./common";

/**
 * 获取活动统计
 * GET /api/v1/insights/activity
 */
export const getActivityStats = async (
  days?: number,
): Promise<MemoActivityStatsDto> => {
  const url = days ? `/insights/activity?days=${days}` : "/insights/activity";
  const response = await apiGet<MemoActivityStatsDto>(url);

  if (response.code !== 0) {
    throw new Error(response.message || "获取活动统计失败");
  }

  return response.data;
};

/**
 * 获取历史上的今天
 * GET /api/v1/insights/on-this-day
 */
export const getOnThisDayMemos = async (): Promise<OnThisDayResponseDto> => {
  const response = await apiGet<OnThisDayResponseDto>("/insights/on-this-day");

  if (response.code !== 0) {
    throw new Error(response.message || "获取历史上的今天失败");
  }

  return response.data;
};

/**
 * 获取每日推荐
 * GET /api/v1/insights/daily-recommendations
 */
export const getDailyRecommendations =
  async (): Promise<DailyRecommendationsResponseDto> => {
    const response = await apiGet<DailyRecommendationsResponseDto>(
      "/insights/daily-recommendations",
    );

    if (response.code !== 0) {
      throw new Error(response.message || "获取每日推荐失败");
    }

    return response.data;
  };
