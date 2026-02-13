/**
 * 主题化按钮组件
 * 
 * 支持多种样式变体和尺寸，符合移动端触控规范
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type TouchableOpacityProps,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  style?: TouchableOpacityProps['style'];
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  // 根据变体获取背景色和文字色
  const getColors = () => {
    const isDark = theme.isDark;

    switch (variant) {
      case 'primary':
        return {
          background: theme.colors.primary,
          foreground: theme.colors.primaryForeground,
        };
      case 'secondary':
        return {
          background: theme.colors.muted,
          foreground: theme.colors.mutedForeground,
        };
      case 'outline':
        return {
          background: 'transparent',
          foreground: theme.colors.foreground,
          borderColor: theme.colors.border,
        };
      case 'ghost':
        return {
          background: 'transparent',
          foreground: theme.colors.foreground,
        };
      case 'destructive':
        return {
          background: theme.colors.destructive,
          foreground: theme.colors.destructiveForeground,
        };
      default:
        return {
          background: theme.colors.primary,
          foreground: theme.colors.primaryForeground,
        };
    }
  };

  // 根据尺寸获取样式
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.fontSizes.sm,
        };
      case 'md':
        return {
          height: theme.touchTargets.minHeight,
          paddingHorizontal: theme.spacing.lg,
          fontSize: theme.fontSizes.base,
        };
      case 'lg':
        return {
          height: 52,
          paddingHorizontal: theme.spacing.xl,
          fontSize: theme.fontSizes.lg,
        };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: colors.background,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: theme.borderRadius.md,
          opacity: isDisabled ? 0.5 : 1,
        },
        variant === 'outline' && {
          borderWidth: 1,
          borderColor: colors.borderColor,
        },
        fullWidth && styles.fullWidth,
        theme.shadows?.md,
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            color={colors.foreground}
            style={styles.loader}
            size="small"
          />
        )}
        <Text
          style={[
            styles.text,
            {
              color: colors.foreground,
              fontSize: sizeStyles.fontSize,
              fontWeight: theme.fontWeights.semibold,
            },
            loading && styles.textWithLoader,
          ]}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  loader: {
    marginRight: 8,
  },
  textWithLoader: {
    marginLeft: 0,
  },
});
