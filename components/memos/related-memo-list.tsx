/**
 * Related Memo List Component - 相关笔记列表组件
 * 支持无限滚动加载，展示与当前笔记相关的其他笔记
 */

import { useTheme } from "@/hooks/use-theme";
import RelatedMemoService from "@/services/related-memo-service";
import { MaterialIcons } from "@expo/vector-icons";
import { bindServices, useService, view } from "@rabjs/react";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

    const handleLoadMore = () => {
      relatedMemoService.loadRelatedMemos(memoId).catch((err) => {
        console.error("加载更多相关笔记失败:", err);
      });
    };

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

      if (
        relatedMemoService.hasMore &&
        relatedMemoService.relatedMemos.length > 0
      ) {
        return (
          <TouchableOpacity
            style={[
              styles.loadMoreButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.backgroundSecondary,
              },
            ]}
            onPress={handleLoadMore}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.loadMoreText,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              加载更多
            </Text>
          </TouchableOpacity>
        );
      }

      if (
        !relatedMemoService.hasMore &&
        relatedMemoService.relatedMemos.length > 0
      ) {
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
          <Text style={[styles.errorText, { color: theme.colors.destructive }]}>
            {relatedMemoService.error}
          </Text>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <View style={styles.listContent}>
          {relatedMemoService.relatedMemos.map((memo, index) => (
            <TouchableOpacity
              key={memo.id || `memo-${index}`}
              style={[
                styles.memoCard,
                { backgroundColor: theme.colors.backgroundTertiary },
              ]}
              onPress={() => handleMemoPress(memo.memoId)}
              activeOpacity={0.7}
            >
              <View style={styles.memoContent}>
                <Text
                  style={[styles.memoText, { color: theme.colors.foreground }]}
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
                    {formatDate(memo.createdAt)}
                  </Text>
                  {memo.relevanceScore !== undefined && (
                    <View style={styles.relevanceBadge}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.relevanceDot,
                            {
                              backgroundColor:
                                level <= Math.ceil(memo.relevanceScore * 5)
                                  ? theme.colors.primary
                                  : theme.colors.foregroundTertiary,
                            },
                          ]}
                        />
                      ))}
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
          ))}
          {renderLoadingIndicator()}
          {renderFooter()}
          {renderEmpty()}
          {renderError()}
        </View>
      </View>
    );
  },
);

RelatedMemoListContent.displayName = "RelatedMemoListContent";

export const RelatedMemoList = bindServices(RelatedMemoListContent, [
  RelatedMemoService,
]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
  },
  listContent: {
    paddingVertical: 8,
    gap: 8,
  },
  memoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  relevanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
  loadMoreButton: {
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: "500",
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
