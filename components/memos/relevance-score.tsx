/**
 * Relevance Score Component - 相关性分数组件
 * 将 0-1 的原始分数转换为 0-5 分，以 5 个格子形式展示
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/hooks/use-theme";

interface RelevanceScoreProps {
  /** 原始分数 (0-1) */
  score: number;
  /** 是否显示文字标签 */
  showLabel?: boolean;
  /** 自定义样式 */
  style?: any;
}

/**
 * 将 0-1 分数转换为 0-5 整数分
 * @param score 原始分数 (0-1)
 * @returns 转换后的分数 (0-5)
 */
export function getRelevanceScore(score: number): number {
  if (score <= 0) return 0;
  if (score >= 1) return 5;
  return Math.round(score * 5);
}

/**
 * 根据分数获取颜色
 * 0-2: 灰色（低相关）
 * 3: 黄色（中等相关）
 * 4-5: 绿色（高相关）
 */
function getScoreColor(score: number, theme: any): string {
  if (score <= 2) return theme.colors.foregroundTertiary;
  if (score === 3) return theme.colors.warning;
  return theme.colors.success;
}

/**
 * 根据分数获取描述文字
 */
function getScoreLabel(score: number): string {
  if (score <= 1) return "弱相关";
  if (score <= 2) return "较低相关";
  if (score === 3) return "中等相关";
  if (score === 4) return "较高相关";
  return "强相关";
}

export function RelevanceScore({
  score,
  showLabel = false,
  style,
}: RelevanceScoreProps) {
  const theme = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const convertedScore = getRelevanceScore(score);
  const scoreColor = getScoreColor(convertedScore, theme);

  // 渲染 5 个格子
  const renderBars = () => {
    return (
      <View style={styles.barsContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor:
                  index < convertedScore
                    ? scoreColor
                    : theme.colors.foregroundTertiary + "30", // 30% 透明度
              },
              index === 0 && styles.barFirst,
              index === 4 && styles.barLast,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => setShowTooltip(true)}
        onPressOut={() => setShowTooltip(false)}
        style={styles.touchable}
      >
        <View style={styles.content}>
          {renderBars()}
          {showLabel && (
            <Text
              style={[
                styles.label,
                { color: scoreColor },
              ]}
            >
              {getScoreLabel(convertedScore)}
            </Text>
          )}
        </View>

        {/* Tooltip */}
        {showTooltip && (
          <View
            style={[
              styles.tooltip,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <Text
              style={[
                styles.tooltipText,
                { color: theme.colors.foreground },
              ]}
            >
              相关度: {convertedScore}/5
            </Text>
            <Text
              style={[
                styles.tooltipSubtext,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              {getScoreLabel(convertedScore)}
            </Text>
            {/* 小三角形 */}
            <View
              style={[
                styles.tooltipArrow,
                { borderTopColor: theme.colors.card },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  touchable: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginHorizontal: -4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  barsContainer: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  bar: {
    width: 8,
    height: 12,
    borderRadius: 2,
  },
  barFirst: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  barLast: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
  tooltip: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    marginLeft: -40,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 80,
    // iOS 阴影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tooltipSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
});
