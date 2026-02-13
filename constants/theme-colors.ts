/**
 * App 主题系统
 * 
 * 基于 Web 端的设计系统，适配移动端平台特性：
 * - 保持与 Web 端一致的颜色值（主色 #22c55e）
 * - 适应 iOS/Android 设计规范
 * - 支持深色模式
 * - 触控友好的尺寸（最小 44x44pt）
 * - 考虑安全区域和系统控件空间
 */

import { Platform } from 'react-native';

/**
 * 颜色系统
 * 与 Web 端保持一致的颜色定义
 */
export const Colors = {
  light: {
    // 主色系 - 与 Web 端保持一致
    primary: '#22c55e',
    primaryForeground: '#ffffff',
    
    // 背景色（浅灰色，用于 memo 列表背景）
    background: '#f3f4f6',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#f3f4f6',
    
    // 前景色 / 文本色
    foreground: '#111827',
    foregroundSecondary: '#6b7280',
    foregroundTertiary: '#9ca3af',
    
    // 卡片（白色，与背景形成对比）
    card: '#ffffff',
    cardForeground: '#111827',
    
    // 输入框
    input: '#e5e7eb',
    inputForeground: '#111827',
    inputPlaceholder: '#9ca3af',
    
    // 边框
    border: '#e5e7eb',
    borderSecondary: '#f3f4f6',
    
    // 分隔线
    divider: '#e5e7eb',
    
    // 按钮
    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
    
    // 强调色
    accent: '#f3f4f6',
    accentForeground: '#111827',
    
    // 状态色
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    success: '#22c55e',
    successForeground: '#ffffff',
    warning: '#f59e0b',
    warningForeground: '#ffffff',
    info: '#3b82f6',
    infoForeground: '#ffffff',
    
    // 标签栏
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#22c55e',
    tabBar: '#ffffff',
    tabBarBorder: '#e5e7eb',
    
    // 覆盖层
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    
    // 阴影（React Native 用于 elevation）
    shadow: '#000000',
  },
  dark: {
    // 主色系
    primary: '#22c55e',
    primaryForeground: '#ffffff',
    
    // 背景色（深灰色，用于 memo 列表背景）
    background: '#1a1a1a',
    backgroundSecondary: '#171717',
    backgroundTertiary: '#262626',
    
    // 前景色 / 文本色
    foreground: '#fafafa',
    foregroundSecondary: '#a1a1aa',
    foregroundTertiary: '#71717a',
    
    // 卡片（深卡片色，与背景形成对比）
    card: '#262626',
    cardForeground: '#fafafa',
    
    // 输入框
    input: '#3f3f46',
    inputForeground: '#fafafa',
    inputPlaceholder: '#71717a',
    
    // 边框
    border: '#3f3f46',
    borderSecondary: '#262626',
    
    // 分隔线
    divider: '#3f3f46',
    
    // 按钮
    muted: '#262626',
    mutedForeground: '#a1a1aa',
    
    // 强调色
    accent: '#262626',
    accentForeground: '#fafafa',
    
    // 状态色
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    success: '#22c55e',
    successForeground: '#ffffff',
    warning: '#f59e0b',
    warningForeground: '#ffffff',
    info: '#3b82f6',
    infoForeground: '#ffffff',
    
    // 标签栏
    tabIconDefault: '#71717a',
    tabIconSelected: '#22c55e',
    tabBar: '#171717',
    tabBarBorder: '#3f3f46',
    
    // 覆盖层
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    
    // 阴影
    shadow: '#000000',
  },
};

/**
 * 字体系统
 * 使用系统原生字体，确保最佳性能和一致性
 */
export const Fonts = Platform.select({
  ios: {
    /** iOS 默认系统字体 */
    sans: 'system-ui',
    /** iOS 衬线字体 */
    serif: 'ui-serif',
    /** iOS 圆角字体 */
    rounded: 'ui-rounded',
    /** iOS 等宽字体 */
    mono: 'ui-monospace',
  },
  android: {
    /** Android 默认系统字体 */
    sans: 'normal',
    /** Android 衬线字体 */
    serif: 'serif',
    /** Android 等宽字体 */
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * 字体大小系统
 * 适配移动端触控交互，相比 Web 端略微增大基础字号
 */
export const FontSizes = {
  xs: 11,    // 极小文本（时间戳、标签）
  sm: 13,    // 小文本（辅助说明）
  base: 15,  // 基础文本（正文内容）- 移动端增大 1px
  lg: 17,    // 大文本（标题）
  xl: 19,    // 超大文本（页面标题）
  '2xl': 23, // 特大文本
  '3xl': 28, // 巨大文本
};

/**
 * 字体粗细
 */
export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/**
 * 行高系统
 */
export const LineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

/**
 * 间距系统
 * 移动端适当增大间距，提升触控体验
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

/**
 * 圆角系统
 */
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

/**
 * 阴影系统
 * iOS 使用 shadowColor/shadowOffset/shadowOpacity/shadowRadius
 * Android 使用 elevation
 */
export const Shadows = Platform.select({
  ios: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
  },
  android: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
    xl: { elevation: 16 },
  },
  default: {
    sm: {},
    md: {},
    lg: {},
    xl: {},
  },
});

/**
 * 触控尺寸
 * 确保交互元素符合平台规范（iOS: 44pt, Android: 48dp）
 */
export const TouchTargets = {
  minHeight: Platform.select({
    ios: 44,
    android: 48,
    default: 44,
  }),
  minWidth: Platform.select({
    ios: 44,
    android: 48,
    default: 44,
  }),
};

/**
 * Z-Index 层级
 */
export const ZIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  toast: 60,
};

/**
 * 动画时长
 */
export const Durations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

/**
 * 类型定义
 */
export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;
export type ColorKey = keyof ThemeColors;
