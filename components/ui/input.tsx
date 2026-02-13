/**
 * 主题化输入框组件
 * 
 * 提供一致的输入框样式，支持不同状态和变体
 */

import React, { forwardRef } from 'react';
import {
  TextInput,
  type TextInputProps,
  StyleSheet,
  View,
  type ViewProps,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * 输入框标签
   */
  label?: string;
  /**
   * 错误消息
   */
  error?: string;
  /**
   * 是否全宽
   */
  fullWidth?: boolean;
  /**
   * 样式覆盖
   */
  style?: TextInputProps['style'];
  /**
   * 容器样式
   */
  containerStyle?: ViewProps['style'];
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      fullWidth = true,
      style,
      containerStyle,
      editable = true,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const hasError = !!error;

    return (
      <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: theme.colors.foreground,
                fontSize: theme.fontSizes.sm,
                fontWeight: theme.fontWeights.medium,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={theme.colors.inputPlaceholder}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.inputForeground,
              borderColor: hasError ? theme.colors.destructive : theme.colors.border,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.fontSizes.base,
              height: theme.touchTargets.minHeight,
              paddingHorizontal: theme.spacing.md,
            },
            !editable && {
              opacity: 0.5,
            },
            style,
          ]}
          {...props}
        />
        {hasError && (
          <Text
            style={[
              styles.error,
              {
                color: theme.colors.destructive,
                fontSize: theme.fontSizes.xs,
                marginTop: theme.spacing.xs,
              },
            ]}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
  },
  error: {
    marginTop: 4,
  },
});
