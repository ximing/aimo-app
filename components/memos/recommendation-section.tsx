/**
 * Recommendation Section Component - 推荐模块容器组件
 * 展示每日推荐和历史的今天备忘录的横向列表
 * 使用 @rabjs/react 的 view 装饰器以响应响应式数据变化
 */

import { RecommendationCard } from "@/components/memos/recommendation-card";
import { useTheme } from "@/hooks/use-theme";
import RecommendationService from "@/services/recommendation.service";
import { useService, view } from "@rabjs/react";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const RecommendationSectionComponent = view(() => {
  const theme = useTheme();
  const recommendationService = useService(RecommendationService);

  // 组件加载时获取推荐数据
  useEffect(() => {
    recommendationService.fetchRecommendations();
  }, [recommendationService]);

  // 合并推荐和历史今天数据
  const allItems = [...recommendationService.recommendations, ...recommendationService.historyToday];

  // 空数据时隐藏模块
  if (!recommendationService.loading && allItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>
          今日推荐
        </Text>
      </View>

      {/* 加载状态 */}
      {recommendationService.loading && allItems.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 骨架屏占位 */}
            {[1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.skeletonCard,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <View
                  style={[
                    styles.skeletonTitle,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonTag,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonDate,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        /* 推荐列表 */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {allItems.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </ScrollView>
      )}

      {/* 错误提示 */}
      {recommendationService.error && (
        <Text
          style={[
            styles.errorText,
            { color: theme.colors.destructive },
          ]}
        >
          {recommendationService.error}
        </Text>
      )}
    </View>
  );
});

// 导出使用 view 包装的组件
export const RecommendationSection = RecommendationSectionComponent;

RecommendationSection.displayName = "RecommendationSection";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    minHeight: 100,
  },
  // 骨架屏样式
  skeletonCard: {
    width: 200,
    padding: 14,
    borderRadius: 12,
    marginRight: 12,
  },
  skeletonTitle: {
    width: "80%",
    height: 18,
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonTag: {
    width: 60,
    height: 18,
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonDate: {
    width: 40,
    height: 14,
    borderRadius: 4,
  },
  errorText: {
    paddingHorizontal: 16,
    paddingTop: 8,
    fontSize: 13,
  },
});
