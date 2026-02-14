/**
 * Memo Item Component - 备忘录列表项
 * 使用 @rabjs/react 的 view 装饰器以响应响应式数据变化（包括主题）
 * 同时保持性能优化
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { view } from '@rabjs/react';
import { useTheme } from '@/hooks/use-theme';
import type { Memo } from '@/types/memo';

// 启用 LayoutAnimation (Android 需要特殊处理)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MemoItemProps {
  memo: Memo;
  onPress?: (memoId: string) => void;
}

const MemoItemComponent = view(({ memo, onPress }: MemoItemProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // 格式化时间显示
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 处理展开/收起动画
  const toggleExpanded = (e: any) => {
    e.stopPropagation?.();
    
    // 使用 LayoutAnimation 实现平滑过渡
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
    
    setIsExpanded(!isExpanded);
  };

  // 计算是否需要截断（超过150个字符）
  const getContentDisplay = () => {
    const contentLength = memo.content.length;
    const shouldTruncate = contentLength > 150;
    
    if (isExpanded) {
      return {
        text: memo.content,
        shouldTruncate,
      };
    }
    
    if (shouldTruncate) {
      // 截断到150个字符
      const truncatedContent = memo.content.substring(0, 150);
      return {
        text: truncatedContent,
        shouldTruncate: true,
      };
    }
    
    return {
      text: memo.content,
      shouldTruncate: false,
    };
  };

  const contentDisplay = getContentDisplay();

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { marginHorizontal: theme.spacing.md, marginVertical: theme.spacing.xs }]}
      onPress={() => onPress?.(memo.memoId)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
        }
      ]}>
        {/* 卡片头部 - 只有标题和内容 */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContent}>
            {memo.title && (
              <Text
                style={[styles.title, { color: theme.colors.foreground }]}
                numberOfLines={2}
              >
                {memo.title}
              </Text>
            )}
            <View style={styles.contentWrapper}>
              <Text
                style={[
                  styles.text,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                {contentDisplay.text}
                {!isExpanded && contentDisplay.shouldTruncate && (
                  <>
                    <Text style={[styles.expandText, { color: theme.colors.primary }]}>...</Text>
                    <Text
                      onPress={toggleExpanded}
                      style={[
                        styles.expandText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      展开
                    </Text>
                  </>
                )}
              </Text>
              {isExpanded && contentDisplay.shouldTruncate && (
                <TouchableOpacity 
                  onPress={toggleExpanded}
                  activeOpacity={0.7}
                  style={styles.collapseButton}
                >
                  <Text
                    style={[
                      styles.expandText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    收起
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* 卡片页脚 - 时间和更多按钮放在一排 */}
        <View style={styles.cardFooter}>
          <View style={styles.metaInfo}>
            <View style={styles.leftMeta}>
              <Text style={[styles.date, { color: theme.colors.foregroundTertiary }]}>
                {formatDate(memo.updatedAt)}
              </Text>

              {memo.attachments.length > 0 && (
                <View style={styles.attachmentBadge}>
                  <MaterialIcons name="attach-file" size={12} color={theme.colors.info} />
                  <Text style={[styles.attachmentCount, { color: theme.colors.info }]}>
                    {memo.attachments.length}
                  </Text>
                </View>
              )}
            </View>

            {/* 右侧菜单按钮 */}
            <TouchableOpacity style={styles.moreButton}>
              <MaterialIcons name="more-horiz" size={20} color={theme.colors.foregroundSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// 导出使用 view 包装的组件
// view 会自动跟踪组件中使用的响应式数据（包括 useTheme）
// 当这些数据变化时，组件会自动重新渲染
export const MemoItem = MemoItemComponent;

MemoItem.displayName = 'MemoItem';

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContent: {
    flex: 1,
  },
  moreButton: {
    padding: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
  contentWrapper: {
    flex: 1,
  },
  expandText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  collapseButton: {
    marginTop: 6,
  },
  cardFooter: {
    paddingTop: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  date: {
    fontSize: 12,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  attachmentCount: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
});
