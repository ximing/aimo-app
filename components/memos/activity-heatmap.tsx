/**
 * Activity Heatmap Component - 活动热力图
 * 显示用户最近90天的提交活动统计
 * 采用 7行×12列 网格布局（周一到周日 × 12周）
 *
 * 页面特定组件：仅在侧边栏中使用
 */

import { useTheme } from "@/hooks/use-theme";
import { view } from "@rabjs/react";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { MemoActivityStatsItemDto } from "@/types/insights";

interface ActivityHeatmapProps {
  data: MemoActivityStatsItemDto[];
  isLoading?: boolean;
}

// 热力图单元格类型
type HeatmapCell = {
  date: string;
  count: number;
  level: number;
};

// 热力颜色配置
// 亮色主题
const LIGHT_COLORS = {
  level0: "#e5e7eb", // 灰色-200，无活动
  level1: "#bbf7d0", // primary-200
  level2: "#4ade80", // primary-400
  level3: "#16a34a", // primary-600
  level4: "#166534", // primary-800
};

// 暗色主题
const DARK_COLORS = {
  level0: "#2a2a2a", // dark-800
  level1: "rgba(22, 101, 52, 0.3)", // primary-900/30
  level2: "#15803d", // primary-700
  level3: "#22c55e", // primary-500
  level4: "#4ade80", // primary-400
};

// 格子尺寸配置 - 自适应铺满容器
// SidebarDrawer 宽度为 280px，paddingHorizontal 16*2 = 32px，可用宽度 248px
// 12列，间距 11 * 2px = 22px，剩余 226px for cells = 18.8px per cell
const CELL_SIZE = 18;
const CELL_GAP = 2;
const WEEKS = 12;

export const ActivityHeatmap = view(
  ({ data, isLoading }: ActivityHeatmapProps) => {
    const theme = useTheme();
    const isDark = theme.isDark;
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

    // 将数据转换为热力级别
    const heatmapData = useMemo(() => {
      const today = new Date();
      const statsMap = new Map<string, number>();

      // 将 API 数据转换为 Map
      data.forEach((item) => {
        statsMap.set(item.date, item.count);
      });

      // 计算最大活动数（用于分级）
      let maxCount = 0;
      data.forEach((item) => {
        if (item.count > maxCount) maxCount = item.count;
      });

      // 生成 7×12 网格数据（84天，从12周前的周一到现在）
      const grid: { date: string; count: number; level: number }[] = [];

      // 找到当前周一的日期
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const currentMonday = new Date(today);
      currentMonday.setDate(today.getDate() + mondayOffset);

      // 从12周前的周一开始
      const startDate = new Date(currentMonday);
      startDate.setDate(currentMonday.getDate() - (WEEKS - 1) * 7);

      // 生成84天的数据
      for (let week = 0; week < WEEKS; week++) {
        for (let day = 0; day < 7; day++) {
          const cellDate = new Date(startDate);
          cellDate.setDate(startDate.getDate() + week * 7 + day);

          // 跳过未来的日期
          if (cellDate > today) {
            grid.push({
              date: cellDate.toISOString().split("T")[0],
              count: 0,
              level: 0,
            });
            continue;
          }

          const dateStr = cellDate.toISOString().split("T")[0];
          const count = statsMap.get(dateStr) || 0;

          // 计算热力级别
          let level = 0;
          if (count > 0) {
            if (maxCount === 0) {
              level = 1;
            } else {
              const ratio = count / maxCount;
              if (ratio <= 0.25) level = 1;
              else if (ratio <= 0.5) level = 2;
              else if (ratio <= 0.75) level = 3;
              else level = 4;
            }
          }

          grid.push({ date: dateStr, count, level });
        }
      }

      return grid;
    }, [data]);

    // 获取热力级别对应的颜色
    const getLevelColor = (level: number): string => {
      switch (level) {
        case 0:
          return colors.level0;
        case 1:
          return colors.level1;
        case 2:
          return colors.level2;
        case 3:
          return colors.level3;
        case 4:
          return colors.level4;
        default:
          return colors.level0;
      }
    };

    // 按周分组（列）- 生成 12x7 的二维数组
    const weeks = useMemo((): HeatmapCell[][] => {
      const result: HeatmapCell[][] = [];
      for (let i = 0; i < heatmapData.length; i += 7) {
        result.push(heatmapData.slice(i, i + 7));
      }
      return result;
    }, [heatmapData]);

    if (isLoading) {
      return (
        <View style={styles.container}>
          <Text style={[styles.loadingText, { color: theme.colors.foregroundTertiary }]}>
            加载中...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {/* 热力图网格 - 列是周，行是星期几 */}
        <View style={styles.gridContainer}>
          {weeks.map((weekData, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekColumn}>
              {weekData.map((dayData, dayIndex) => (
                <View
                  key={`cell-${weekIndex}-${dayIndex}`}
                  style={[
                    styles.cell,
                    { backgroundColor: getLevelColor(dayData.level) },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        {/* 图例 */}
        <View style={styles.legendContainer}>
          <Text style={[styles.legendLabel, { color: theme.colors.foregroundTertiary }]}>
            少
          </Text>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={`legend-${level}`}
              style={[styles.legendCell, { backgroundColor: getLevelColor(level) }]}
            />
          ))}
          <Text style={[styles.legendLabel, { color: theme.colors.foregroundTertiary }]}>
            多
          </Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekColumn: {
    flexDirection: "column",
    marginRight: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    marginBottom: CELL_GAP,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 0,
  },
  legendLabel: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  legendCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  loadingText: {
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 20,
  },
});
