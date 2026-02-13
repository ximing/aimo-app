import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme';
import type { ColorKey } from '@/constants/theme-colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  /**
   * 使用主题颜色名称（如 'background', 'card', 'backgroundSecondary' 等）
   */
  colorKey?: ColorKey;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  colorKey = 'background',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    colorKey
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
