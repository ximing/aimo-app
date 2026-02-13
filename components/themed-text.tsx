import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme, useThemeColor } from '@/hooks/use-theme';
import type { ColorKey } from '@/constants/theme-colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  /**
   * 使用主题颜色名称
   */
  colorKey?: ColorKey;
  /**
   * 文本类型预设样式
   */
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'link' | 'semibold' | 'bold';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  colorKey = 'foreground',
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'semibold' ? styles.semibold : undefined,
        type === 'bold' ? styles.bold : undefined,
        type === 'link'
          ? [styles.link, { color: theme.colors.primary }]
          : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 15, // 使用 FontSizes.base
    lineHeight: 22.5, // 15 * 1.5
    fontWeight: '400',
  },
  semibold: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '600',
  },
  bold: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '700',
  },
  title: {
    fontSize: 28, // 使用 FontSizes['3xl']
    fontWeight: '700',
    lineHeight: 35, // 28 * 1.25 (tight)
  },
  subtitle: {
    fontSize: 19, // 使用 FontSizes.xl
    fontWeight: '600',
    lineHeight: 28.5, // 19 * 1.5
  },
  caption: {
    fontSize: 13, // 使用 FontSizes.sm
    lineHeight: 19.5, // 13 * 1.5
    fontWeight: '400',
  },
  link: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
