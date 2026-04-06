/**
 * 主题 Hook
 * 提供完整的主题访问能力
 */

import { useColorScheme as useRNColorScheme, ColorSchemeName } from 'react-native';

/**
 * Normalize ColorSchemeName to 'light' | 'dark'
 * Handles 'unspecified' value from newer React Native versions
 */
function normalizeColorScheme(scheme: ColorSchemeName): 'light' | 'dark' {
  if (scheme === 'unspecified' || scheme === null || scheme === undefined) {
    return 'light';
  }
  return scheme;
}
import { useService } from '@rabjs/react';
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
import ThemeService from '@/services/theme-service';

/**
 * 获取当前主题配置
 * 
 * 如果应用中使用了 ThemeService，主题会由服务管理
 * 否则会自动跟随系统主题设置
 */
export function useTheme() {
  const systemColorScheme = normalizeColorScheme(useRNColorScheme());
  
  // 获取 ThemeService 来实现主题切换
  // useService 会自动使 Hook 响应服务的可观测属性变化
  const themeService = useService(ThemeService);
  
  // 获取实际的颜色方案（考虑 ThemeService 的设置）
  // colorScheme 是计算属性，会根据 mode 动态改变
  const colorScheme = themeService.colorScheme;

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
  const colorScheme = normalizeColorScheme(useRNColorScheme());
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
  return normalizeColorScheme(useRNColorScheme());
}

/**
 * 类型导出
 */
export type { ColorScheme, ThemeColors, ColorKey };
