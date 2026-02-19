/**
 * Related Memo List Component - 相关笔记列表组件
 * 支持无限滚动加载，展示与当前笔记相关的其他笔记
 */

import React, { useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import RelatedMemoService from "@/services/related-memo-service";
import { bindServices, useService, view } from "@rabjs/react";
import type { RelatedMemoItem } from "@/types/memo";

interface RelatedMemoListProps {
  memoId: string;
  onMemoPress?: (memoId: string) => void;
}

const RelatedMemoListContent = view(
  ({ memoId, onMemoPress }: RelatedMemoListProps) => {
    const theme = useTheme();
    const relatedMemoService = useService(RelatedMemoService);

    // 初始加载
    useEffect(() => {
      if (memoId) {
        relatedMemoService.loadRelatedMemos(memoId).catch((err) => {
          console.error("加载相关笔记失败:", err);
        });
      }

      // 组件卸载时重置状态
      return () => {
        relatedMemoService.reset();
      };
    }, [memoId, relatedMemoService]);

    // 处理滚动事件，实现无限滚动
    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } =
          event.nativeEvent;
        const paddingToBottom = 50;
        const isCloseToBottom =
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom;

        if (isCloseToBottom && relatedMemoService.hasMore && !relatedMemoService.loading) {
          relatedMemoService.loadRelatedMemos(memoId).catch((err) => {
            console.error("加载更多相关笔记失败:", err);
          });
        }
      },
      [memoId, relatedMemoService]
    );

    // 格式化时间显示
    const formatDate = (timestamp: number): string => {
      const date = new Date(timestamp);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    };

    // 处理笔记点击
    const handleMemoPress = (memoId: string) => {
      onMemoPress?.(memoId);
    };

    // 渲染单个相关笔记卡片
    const renderRelatedMemoCard = (memo: RelatedMemoItem) => (
      <TouchableOpacity
        key={memo.id}
        style={[
          styles.memoCard,
          { backgroundColor: theme.colors.background },
        ]}
        onPress={() => handleMemoPress(memo.memoId)}
        activeOpacity={0.7}
      >
        <View style={styles.memoContent}>
          <Text
            style={[
              styles.memoText,
              { color: theme.colors.foreground },
            ]}
            numberOfLines={2}
          >
            {memo.content}
          </Text>
          <View style={styles.memoMeta}>
            <Text
              style={[
                styles.memoDate,
                { color: theme.colors.foregroundTertiary },
              ]}
            >
              {formatDate(memo.createTime)}
            </Text>
            {memo.relevanceScore !== undefined && (
              <View style={styles.relevanceBadge}>
                <Text
                  style={[
                    styles.relevanceText,
                    { color: theme.colors.primary },
                  ]}
                >
                  相关度: {Math.round(memo.relevanceScore * 100)}%
                </Text>
              </View>
            )}
          </View>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={theme.colors.foregroundTertiary}
        />
      </TouchableOpacity>
    );

    // 渲染加载指示器
    const renderLoadingIndicator = () => {
      if (!relatedMemoService.loading) return null;

      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.info} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.foregroundTertiary },
            ]}
          >
            加载中...
          </Text>
        </View>
      );
    };

    // 渲染底部状态
    const renderFooter = () => {
      if (relatedMemoService.loading) return null;

      if (!relatedMemoService.hasMore && relatedMemoService.relatedMemos.length > 0) {
        return (
          <View style={styles.footerContainer}>
            <Text
              style={[
                styles.footerText,
                { color: theme.colors.foregroundTertiary },
              ]}
            >
              已加载全部相关笔记
            </Text>
          </View>
        );
      }

      return null;
    };

    // 渲染空状态
    const renderEmpty = () => {
      if (
        relatedMemoService.relatedMemos.length === 0 &&
        !relatedMemoService.loading
      ) {
        return (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="link-off"
              size={32}
              color={theme.colors.foregroundTertiary}
            />
            <Text
              style={[
                styles.emptyText,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              暂无相关笔记
            </Text>
          </View>
        );
      }

      return null;
    };

    // 渲染错误状态
    const renderError = () => {
      if (!relatedMemoService.error) return null;

      return (
        <View style={styles.errorContainer}>
          <MaterialIcons
            name="error-outline"
            size={24}
            color={theme.colors.destructive}
          />
          <Text
            style={[
              styles.errorText,
              { color: theme.colors.destructive },
            ]}
          >
            {relatedMemoService.error}
          </Text>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          showsVerticalScrollIndicator={false}
        >
          {relatedMemoService.relatedMemos.map(renderRelatedMemoCard)}
          {renderLoadingIndicator()}
          {renderFooter()}
          {renderEmpty()}
          {renderError()}
        </ScrollView>
      </View>
    );
  }
);

RelatedMemoListContent.displayName = "RelatedMemoListContent";

export const RelatedMemoList = bindServices(RelatedMemoListContent, [
  RelatedMemoService,
]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    gap: 8,
  },
  memoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 0,
  },
  memoContent: {
    flex: 1,
    marginRight: 8,
  },
  memoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  memoMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memoDate: {
    fontSize: 12,
  },
  relevanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  relevanceText: {
    fontSize: 11,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
  },
});
