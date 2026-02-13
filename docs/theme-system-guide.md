# App 主题系统使用指南

基于 Web 端设计系统，适配移动端平台特性的完整主题解决方案。

## 目录

- [核心特性](#核心特性)
- [颜色系统](#颜色系统)
- [使用主题](#使用主题)
- [主题化组件](#主题化组件)
- [自定义组件](#自定义组件)
- [平台适配](#平台适配)
- [最佳实践](#最佳实践)

## 核心特性

### 🎨 与 Web 端一致的颜色

- 主色：`#22c55e`（绿色）
- 完整的语义化颜色系统
- 自动深色模式支持

### 📱 移动端优化

- iOS/Android 设计规范适配
- 触控友好尺寸（最小 44x44pt）
- 平台特定的阴影和字体
- 安全区域考量

### 🎯 完整的设计令牌

- 颜色、字体、间距、圆角
- 阴影、动画时长、层级
- 触控目标尺寸

## 颜色系统

### 主色系

```typescript
import { useTheme } from '@/hooks/use-theme';

const MyComponent = () => {
  const theme = useTheme();
  
  // 主色
  const primary = theme.colors.primary;          // #22c55e
  const primaryFg = theme.colors.primaryForeground; // #ffffff
};
```

### 背景色

```typescript
background           // #ffffff (light) / #0a0a0a (dark)
backgroundSecondary  // #f9fafb (light) / #171717 (dark)
backgroundTertiary   // #f3f4f6 (light) / #262626 (dark)
```

### 前景色/文本色

```typescript
foreground           // #111827 (light) / #fafafa (dark)
foregroundSecondary  // #6b7280 (light) / #a1a1aa (dark)
foregroundTertiary   // #9ca3af (light) / #71717a (dark)
```

### 状态色

```typescript
destructive          // 危险操作（删除等）
success              // 成功状态
warning              // 警告状态
info                 // 信息提示
```

### 完整颜色列表

参见 `constants/theme-colors.ts` 中的 `Colors` 定义。

## 使用主题

### 1. useTheme Hook（推荐）

获取完整的主题配置：

```tsx
import { useTheme } from '@/hooks/use-theme';
import { View, Text, StyleSheet } from 'react-native';

export function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
      },
      theme.shadows?.md,
    ]}>
      <Text style={{
        color: theme.colors.foreground,
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.semibold,
      }}>
        Hello Theme!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### 2. useThemeColor Hook

仅获取特定颜色，支持 props 覆盖：

```tsx
import { useThemeColor } from '@/hooks/use-theme';

export function MyComponent({ lightColor, darkColor }) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );
  
  return <View style={{ backgroundColor }} />;
}
```

### 3. useColorScheme Hook

获取当前主题模式：

```tsx
import { useColorScheme } from '@/hooks/use-theme';

export function MyComponent() {
  const colorScheme = useColorScheme(); // 'light' | 'dark'
  
  return (
    <Text>当前主题: {colorScheme}</Text>
  );
}
```

## 主题化组件

### ThemedView

主题化的 View 组件：

```tsx
import { ThemedView } from '@/components/themed-view';

<ThemedView>
  {/* 默认使用 background 颜色 */}
</ThemedView>

<ThemedView colorKey="card">
  {/* 使用 card 颜色 */}
</ThemedView>

<ThemedView lightColor="#fff" darkColor="#000">
  {/* 自定义颜色覆盖 */}
</ThemedView>
```

### ThemedText

主题化的 Text 组件：

```tsx
import { ThemedText } from '@/components/themed-text';

{/* 不同类型 */}
<ThemedText type="default">正文文本</ThemedText>
<ThemedText type="title">标题文本</ThemedText>
<ThemedText type="subtitle">副标题</ThemedText>
<ThemedText type="caption">说明文本</ThemedText>
<ThemedText type="semibold">半粗体</ThemedText>
<ThemedText type="bold">粗体</ThemedText>
<ThemedText type="link">链接文本</ThemedText>

{/* 自定义颜色 */}
<ThemedText colorKey="foregroundSecondary">次要文本</ThemedText>
<ThemedText colorKey="primary">主色文本</ThemedText>
```

### Button

主题化按钮组件：

```tsx
import { Button } from '@/components/ui/button';

{/* 不同变体 */}
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">轮廓按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="destructive">危险按钮</Button>

{/* 不同尺寸 */}
<Button size="sm">小按钮</Button>
<Button size="md">中等按钮</Button>
<Button size="lg">大按钮</Button>

{/* 加载状态 */}
<Button loading>加载中...</Button>

{/* 全宽 */}
<Button fullWidth>全宽按钮</Button>
```

### Card

主题化卡片组件：

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <ThemedText type="subtitle">卡片标题</ThemedText>
  </CardHeader>
  <CardContent>
    <ThemedText>卡片内容</ThemedText>
  </CardContent>
  <CardFooter>
    <Button>操作</Button>
  </CardFooter>
</Card>

{/* 自定义样式 */}
<Card shadow={false} bordered padding="lg">
  {/* 无阴影、有边框、大内边距 */}
</Card>
```

### Input

主题化输入框组件：

```tsx
import { Input } from '@/components/ui/input';

<Input 
  label="用户名"
  placeholder="请输入用户名"
/>

<Input 
  label="密码"
  placeholder="请输入密码"
  secureTextEntry
  error="密码不能为空"
/>

<Input 
  label="备注"
  placeholder="请输入备注"
  multiline
  numberOfLines={4}
/>
```

## 自定义组件

### 使用主题创建自定义组件

```tsx
import { useTheme } from '@/hooks/use-theme';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function CustomCard({ title, onPress }) {
  const theme = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        theme.shadows?.sm,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={{
          color: theme.colors.foreground,
          fontSize: theme.fontSizes.lg,
          fontWeight: theme.fontWeights.semibold,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44, // 触控友好
  },
});
```

## 平台适配

### iOS vs Android 差异

#### 阴影

```tsx
const theme = useTheme();

// theme.shadows 会根据平台自动返回正确的样式
// iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
// Android: elevation
<View style={[styles.card, theme.shadows?.md]} />
```

#### 触控尺寸

```tsx
const theme = useTheme();

// iOS: 44pt, Android: 48dp
<TouchableOpacity
  style={{
    minHeight: theme.touchTargets.minHeight,
    minWidth: theme.touchTargets.minWidth,
  }}
/>
```

#### 字体

```tsx
const theme = useTheme();

// 使用平台特定的系统字体
<Text style={{ fontFamily: theme.fonts.sans }}>
  Platform Font
</Text>
```

### 安全区域

使用 `react-native-safe-area-context` 处理安全区域：

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

export function Screen() {
  const theme = useTheme();
  
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right']}
    >
      {/* 内容 */}
    </SafeAreaView>
  );
}
```

## 最佳实践

### 1. 使用语义化颜色

❌ **不好**：
```tsx
<View style={{ backgroundColor: '#22c55e' }} />
```

✅ **好**：
```tsx
const theme = useTheme();
<View style={{ backgroundColor: theme.colors.primary }} />
```

### 2. 使用设计令牌

❌ **不好**：
```tsx
<View style={{ padding: 16, borderRadius: 8 }} />
```

✅ **好**：
```tsx
const theme = useTheme();
<View style={{
  padding: theme.spacing.lg,
  borderRadius: theme.borderRadius.md,
}} />
```

### 3. 确保触控友好

❌ **不好**：
```tsx
<TouchableOpacity style={{ height: 30, width: 30 }}>
  <Icon />
</TouchableOpacity>
```

✅ **好**：
```tsx
const theme = useTheme();
<TouchableOpacity style={{
  minHeight: theme.touchTargets.minHeight,
  minWidth: theme.touchTargets.minWidth,
  alignItems: 'center',
  justifyContent: 'center',
}}>
  <Icon />
</TouchableOpacity>
```

### 4. 使用主题化组件

❌ **不好**：
```tsx
<View style={{ backgroundColor: Colors[colorScheme].background }}>
  <Text style={{ color: Colors[colorScheme].foreground }}>
    Text
  </Text>
</View>
```

✅ **好**：
```tsx
<ThemedView>
  <ThemedText>Text</ThemedText>
</ThemedView>
```

### 5. 平台特定样式

```tsx
import { Platform } from 'react-native';

const theme = useTheme();

<View style={{
  ...Platform.select({
    ios: {
      paddingTop: 20, // 状态栏
    },
    android: {
      paddingTop: 0,
    },
  }),
}} />
```

### 6. 性能优化

```tsx
import { useMemo } from 'react';
import { useTheme } from '@/hooks/use-theme';

export function MyComponent() {
  const theme = useTheme();
  
  // 缓存复杂的样式计算
  const styles = useMemo(
    () => ({
      container: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
      },
    }),
    [theme]
  );
  
  return <View style={styles.container} />;
}
```

## 类型定义

主题系统提供完整的 TypeScript 类型支持：

```typescript
import type {
  ColorScheme,
  ThemeColors,
  ColorKey,
} from '@/constants/theme-colors';

// ColorScheme = 'light' | 'dark'
// ThemeColors = 完整的颜色定义类型
// ColorKey = 所有颜色键名的联合类型
```

## 设计令牌参考

### 字体大小

```typescript
xs: 11    // 时间戳、标签
sm: 13    // 辅助说明
base: 15  // 正文内容
lg: 17    // 标题
xl: 19    // 页面标题
2xl: 23   // 特大文本
3xl: 28   // 巨大文本
```

### 间距

```typescript
xs: 4
sm: 8
md: 12
lg: 16
xl: 20
2xl: 24
3xl: 32
4xl: 40
5xl: 48
```

### 圆角

```typescript
none: 0
sm: 4
md: 8
lg: 12
xl: 16
2xl: 20
full: 9999
```

### 动画时长

```typescript
fast: 150ms
normal: 250ms
slow: 350ms
```

## 常见问题

### Q: 如何强制使用深色模式？

A: 目前主题系统自动跟随系统设置。如需强制模式，可以实现一个主题 Service：

```typescript
// services/theme-service.ts
import { Service } from '@rabjs/react';

class ThemeService extends Service {
  mode: 'light' | 'dark' | 'auto' = 'auto';
  
  setMode(mode: 'light' | 'dark' | 'auto') {
    this.mode = mode;
  }
}

export default ThemeService;
```

### Q: 如何添加自定义颜色？

A: 直接在 `constants/theme-colors.ts` 中的 `Colors` 对象里添加：

```typescript
export const Colors = {
  light: {
    // 现有颜色...
    customColor: '#your-color',
  },
  dark: {
    // 现有颜色...
    customColor: '#your-dark-color',
  },
};
```

### Q: Web 端和 App 端如何共享主题？

A: 保持颜色值一致，但使用平台特定的实现方式。Web 端使用 CSS Variables，App 端使用本主题系统。

---

更多信息请参考：
- [Web 端主题指南](./web-theme-guide.md)
- [项目规范](../.catpaw/rules/base.md)
