/**
 * Recommendation Card Component - 推荐卡片组件
 * 使用 @rabjs/react 的 view 装饰器以响应响应式数据变化
 */

import type { RecommendationItem } from "@/types/recommendation";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { view } from "@rabjs/react";

interface RecommendationCardProps {
  item: RecommendationItem;
}

const RecommendationCardComponent = view(({ item }: RecommendationCardProps) => {
  const theme = useTheme();
  const router = useRouter();

  // 判断是否为推荐类型
  const isRecommendation = item.type === "daily";

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}-${day}`;
  };

  // 处理点击，跳转到详情页
  const handlePress = () => {
    router.push(`/(memos)/${item.id}`);
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
      {/* 标题 */}
      <Text
        style={[styles.title, { color: theme.colors.foreground }]}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {/* 标签 */}
      <View
        style={[
          styles.tag,
          {
            backgroundColor: isRecommendation
              ? "rgba(0, 122, 255, 0.15)"
              : "rgba(255, 149, 0, 0.15)",
          },
        ]}
      >
        <Text
          style={[
            styles.tagText,
            {
              color: isRecommendation ? "#007AFF" : "#FF9500",
            },
          ]}
        >
          {isRecommendation ? "推荐" : "历史的今天"}
        </Text>
      </View>

      {/* 日期 */}
      <Text
        style={[styles.date, { color: theme.colors.foregroundTertiary }]}
      >
        {formatDate(item.createdAt)}
      </Text>
    </TouchableOpacity>
  );
});

// 导出使用 view 包装的组件
export const RecommendationCard = RecommendationCardComponent;

RecommendationCard.displayName = "RecommendationCard";

const styles = StyleSheet.create({
  card: {
    width: 200,
    padding: 14,
    borderRadius: 12,
    marginRight: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 10,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
  },
});
