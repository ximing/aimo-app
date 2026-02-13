/**
 * 主题化卡片组件
 * 
 * 提供一致的卡片样式，支持阴影和边框
 */

import React from 'react';
import { View, type ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export interface CardProps extends ViewProps {
  /**
   * 是否显示阴影
   */
  shadow?: boolean;
  /**
   * 是否显示边框
   */
  bordered?: boolean;
  /**
   * 内边距大小
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  style,
  shadow = true,
  bordered = false,
  padding = 'md',
  ...props
}: CardProps) {
  const theme = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.spacing.sm;
      case 'md':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.lg;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.lg,
          padding: getPadding(),
        },
        shadow && theme.shadows?.md,
        bordered && {
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

/**
 * 卡片头部
 */
export interface CardHeaderProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function CardHeader({
  children,
  style,
  padding = 'md',
  ...props
}: CardHeaderProps) {
  const theme = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.spacing.sm;
      case 'md':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.lg;
    }
  };

  return (
    <View
      style={[
        {
          padding: getPadding(),
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

/**
 * 卡片内容
 */
export interface CardContentProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function CardContent({
  children,
  style,
  padding = 'md',
  ...props
}: CardContentProps) {
  const theme = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.spacing.sm;
      case 'md':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.lg;
    }
  };

  return (
    <View
      style={[
        {
          padding: getPadding(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

/**
 * 卡片底部
 */
export interface CardFooterProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function CardFooter({
  children,
  style,
  padding = 'md',
  ...props
}: CardFooterProps) {
  const theme = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.spacing.sm;
      case 'md':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.lg;
    }
  };

  return (
    <View
      style={[
        {
          padding: getPadding(),
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
