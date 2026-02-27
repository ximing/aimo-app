/**
 * Recommendation Card Component - 推荐卡片组件
 * 使用 @rabjs/react 的 view 装饰器以响应响应式数据变化
 */

import type { MemoListItemDto } from "@/types/memo";
import type { OnThisDayMemoDto } from "@/types/insights";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { view } from "@rabjs/react";

interface RecommendationCardProps {
  item: MemoListItemDto | OnThisDayMemoDto;
}

const RecommendationCardComponent = view(({ item }: RecommendationCardProps) => {
  const theme = useTheme();
  const router = useRouter();

  // 判断是否为历史的今天（通过是否有 year 字段）
  const isHistoryToday = "year" in item && typeof item.year === "number";

  // 格式化日期
  const formatDate = (timestamp: number, year?: number): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    // 如果有年份（历史的今天），显示完整日期
    if (year && year > 0) {
      return `${year}年${month}月${day}日`;
    }
    return `${month}-${day}`;
  };

  // 处理点击，跳转到详情页
  const handlePress = () => {
    router.push(`/(memos)/${item.memoId}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colorScheme === "dark" ? "#000" : "#888",
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* 标题（取 content 的前 30 个字符作为标题） */}
      <Text
        style={[styles.title, { color: theme.colors.foreground }]}
        numberOfLines={2}
      >
        {item.content.slice(0, 30)}{item.content.length > 30 ? "..." : ""}
      </Text>

      {/* 标签和日期放在一行 */}
      <View style={styles.metaRow}>
        <View
          style={[
            styles.tag,
            {
              backgroundColor: isHistoryToday
                ? "rgba(255, 149, 0, 0.15)"
                : "rgba(0, 122, 255, 0.15)",
            },
          ]}
        >
          <Text
            style={[
              styles.tagText,
              {
                color: isHistoryToday ? "#FF9500" : "#007AFF",
              },
            ]}
          >
            {isHistoryToday ? "历史的今天" : "今日推荐"}
          </Text>
        </View>
        <Text
          style={[styles.date, { color: theme.colors.foregroundTertiary }]}
        >
          {formatDate(item.createdAt, isHistoryToday ? (item as OnThisDayMemoDto).year : undefined)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// 导出使用 view 包装的组件
export const RecommendationCard = RecommendationCardComponent;

RecommendationCard.displayName = "RecommendationCard";

const styles = StyleSheet.create({
  card: {
    width: 240,
    padding: 14,
    borderRadius: 12,
    marginRight: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
  },
});
