/**
 * 主题 Hook
 * 提供完整的主题访问能力
 */

import { useColorScheme as useRNColorScheme } from 'react-native';
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  LineHeights,
  Spacing,
  BorderRadius,
  Shadows,
  TouchTargets,
  ZIndex,
  Durations,
  type ColorScheme,
  type ThemeColors,
  type ColorKey,
} from '@/constants/theme-colors';

/**
 * 获取当前主题配置
 * 
 * 注意：如果应用中使用了 ThemeService，主题会由服务管理
 * 否则会自动跟随系统主题设置
 */
export function useTheme() {
  const colorScheme = useRNColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return {
    // 当前主题模式
    colorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',

    // 颜色系统
    colors,

    // 字体系统
    fonts: Fonts,
    fontSizes: FontSizes,
    fontWeights: FontWeights,
    lineHeights: LineHeights,

    // 布局系统
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    touchTargets: TouchTargets,
    zIndex: ZIndex,

    // 动画系统
    durations: Durations,
  };
}

/**
 * 获取主题颜色
 * 支持 props 覆盖和默认颜色名称
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorKey
): string {
  const colorScheme = useRNColorScheme() ?? 'light';
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[colorScheme][colorName];
}

/**
 * 获取当前颜色方案
 */
export function useColorScheme(): ColorScheme {
  return useRNColorScheme() ?? 'light';
}

/**
 * 类型导出
 */
export type { ColorScheme, ThemeColors, ColorKey };
