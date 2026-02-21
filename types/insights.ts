/**
 * Insights API 类型定义
 * 对应文档: /docs/api/insights.md
 */

import type { MemoListItemDto } from "@/types/memo";

/**
 * 每日活动统计项
 */
export interface MemoActivityStatsItemDto {
  date: string; // ISO 日期字符串 (YYYY-MM-DD)
  count: number; // 该日期创建的笔记数量
}

/**
 * 活动统计响应类型
 */
export interface MemoActivityStatsDto {
  items: MemoActivityStatsItemDto[]; // 每日活动统计列表
  startDate: string; // 统计开始日期（ISO 格式）
  endDate: string; // 统计结束日期（ISO 格式）
}

/**
 * 历史上的今天备忘录项
 */
export interface OnThisDayMemoDto {
  memoId: string; // 笔记唯一标识符
  content: string; // 笔记内容
  createdAt: number; // 创建时间戳（毫秒）
  year: number; // 创建年份
}

/**
 * 历史上的今天响应类型
 */
export interface OnThisDayResponseDto {
  items: OnThisDayMemoDto[]; // 历史上的今天创建的笔记列表
  total: number; // 总数量
  todayMonthDay: string; // 当天月日（MM-DD 格式）
}

/**
 * 每日推荐响应类型
 */
export interface DailyRecommendationsResponseDto {
  items: MemoListItemDto[];
  total: number;
}
