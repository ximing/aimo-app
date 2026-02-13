# 主题系统快速参考

## 快速开始

### 1. 使用主题

```typescript
import { useTheme } from '@/hooks/use-theme';

const MyComponent = () => {
  const theme = useTheme();

  return (
    <View style={{
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    }}>
      <Text style={{ color: theme.colors.foreground }}>
        Hello Theme!
      </Text>
    </View>
  );
};
```

### 2. 使用主题化组件

```typescript
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

const MyComponent = () => (
  <ThemedView>
    <ThemedText type="title">标题</ThemedText>
    <ThemedText>正文</ThemedText>
  </ThemedView>
);
```

### 3. 使用 UI 组件

```typescript
import { Button, Card, Input } from '@/components/ui';

<Button variant="primary">点击我</Button>
<Card>
  <Input placeholder="输入内容" />
</Card>
```

## 颜色系统

### 常用颜色

```typescript
// 主色
theme.colors.primary; // #22c55e
theme.colors.primaryForeground; // #ffffff

// 背景色
theme.colors.background; // 主背景
theme.colors.backgroundSecondary; // 次要背景
theme.colors.card; // 卡片背景

// 文本色
theme.colors.foreground; // 主文本
theme.colors.foregroundSecondary; // 次要文本
theme.colors.foregroundTertiary; // 三级文本

// 状态色
theme.colors.success; // 成功 #22c55e
theme.colors.destructive; // 危险 #ef4444
theme.colors.warning; // 警告 #f59e0b
theme.colors.info; // 信息 #3b82f6

// 边框和分隔线
theme.colors.border; // 边框色
theme.colors.divider; // 分隔线色
```

## 字体系统

### 字体大小

```typescript
theme.fontSizes.xs; // 11pt - 时间戳、标签
theme.fontSizes.sm; // 13pt - 辅助说明
theme.fontSizes.base; // 15pt - 正文内容 ⭐️
theme.fontSizes.lg; // 17pt - 标题
theme.fontSizes.xl; // 19pt - 页面标题
theme.fontSizes["2xl"]; // 23pt - 特大文本
theme.fontSizes["3xl"]; // 28pt - 巨大文本
```

### 字体粗细

```typescript
theme.fontWeights.normal; // 400
theme.fontWeights.medium; // 500
theme.fontWeights.semibold; // 600 ⭐️
theme.fontWeights.bold; // 700
```

### 行高

```typescript
theme.lineHeights.tight; // 1.25 - 紧凑
theme.lineHeights.normal; // 1.5 - 正常 ⭐️
theme.lineHeights.relaxed; // 1.75 - 宽松
```

## 间距系统

```typescript
theme.spacing.xs; // 4pt
theme.spacing.sm; // 8pt
theme.spacing.md; // 12pt ⭐️ 常用
theme.spacing.lg; // 16pt ⭐️ 常用
theme.spacing.xl; // 20pt
theme.spacing["2xl"]; // 24pt
theme.spacing["3xl"]; // 32pt
theme.spacing["4xl"]; // 40pt
theme.spacing["5xl"]; // 48pt
```

## 圆角系统

```typescript
theme.borderRadius.none; // 0
theme.borderRadius.sm; // 4pt
theme.borderRadius.md; // 8pt ⭐️ 常用
theme.borderRadius.lg; // 12pt ⭐️ 常用
theme.borderRadius.xl; // 16pt
theme.borderRadius["2xl"]; // 20pt
theme.borderRadius.full; // 9999pt - 圆形
```

## 阴影系统

```typescript
theme.shadows?.sm  // 小阴影
theme.shadows?.md  // 中等阴影 ⭐️ 常用
theme.shadows?.lg  // 大阴影
theme.shadows?.xl  // 超大阴影

// 使用示例
<View style={[styles.card, theme.shadows?.md]} />
```

## 触控目标

```typescript
// 确保交互元素符合平台规范
theme.touchTargets.minHeight  // iOS: 44pt / Android: 48dp
theme.touchTargets.minWidth   // iOS: 44pt / Android: 48dp

// 使用示例
<TouchableOpacity
  style={{
    minHeight: theme.touchTargets.minHeight,
    minWidth: theme.touchTargets.minWidth,
  }}
/>
```

## 动画时长

```typescript
theme.durations.fast; // 150ms - 快速动画
theme.durations.normal; // 250ms - 正常速度 ⭐️
theme.durations.slow; // 350ms - 慢速动画
```

## 层级（Z-Index）

```typescript
theme.zIndex.base; // 0
theme.zIndex.dropdown; // 10
theme.zIndex.sticky; // 20
theme.zIndex.fixed; // 30
theme.zIndex.modal; // 40
theme.zIndex.popover; // 50
theme.zIndex.toast; // 60
```

## ThemedText 类型

```typescript
<ThemedText type="default">正文文本</ThemedText>
<ThemedText type="title">标题文本</ThemedText>
<ThemedText type="subtitle">副标题</ThemedText>
<ThemedText type="caption">说明文本</ThemedText>
<ThemedText type="semibold">半粗体</ThemedText>
<ThemedText type="bold">粗体</ThemedText>
<ThemedText type="link">链接文本</ThemedText>
```

## Button 变体

```typescript
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">轮廓按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="destructive">危险按钮</Button>
```

## Button 尺寸

```typescript
<Button size="sm">小按钮 (36pt)</Button>
<Button size="md">中等按钮 (44/48pt) ⭐️</Button>
<Button size="lg">大按钮 (52pt)</Button>
```

## Card 使用

```typescript
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <ThemedText type="subtitle">标题</ThemedText>
  </CardHeader>
  <CardContent>
    <ThemedText>内容</ThemedText>
  </CardContent>
  <CardFooter>
    <Button>操作</Button>
  </CardFooter>
</Card>

// 自定义样式
<Card shadow={false} bordered padding="lg">
  {/* 无阴影、有边框、大内边距 */}
</Card>
```

## Input 使用

```typescript
<Input
  label="用户名"
  placeholder="请输入用户名"
  value={value}
  onChangeText={setValue}
/>

<Input
  label="密码"
  placeholder="请输入密码"
  secureTextEntry
  error="密码不能为空"
/>
```

## 常见模式

### 创建一个卡片

```typescript
const MyCard = () => {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        theme.shadows?.md,
      ]}
    >
      <Text style={{
        color: theme.colors.foreground,
        fontSize: theme.fontSizes.lg,
        fontWeight: theme.fontWeights.semibold,
      }}>
        Card Title
      </Text>
    </View>
  );
};
```

### 创建一个可点击的列表项

```typescript
const ListItem = ({ title, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={{
        padding: theme.spacing.lg,
        minHeight: theme.touchTargets.minHeight,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{
        color: theme.colors.foreground,
        fontSize: theme.fontSizes.base,
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

### 创建一个输入表单

```typescript
const MyForm = () => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Input
        label="姓名"
        placeholder="请输入姓名"
        value={name}
        onChangeText={setName}
      />
      <Input
        label="邮箱"
        placeholder="请输入邮箱"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button fullWidth>提交</Button>
    </View>
  );
};
```

## 平台适配

### 安全区域

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView
  style={{ flex: 1, backgroundColor: theme.colors.background }}
  edges={['top', 'left', 'right']}
>
  {/* 内容 */}
</SafeAreaView>
```

### 平台特定样式

```typescript
import { Platform } from 'react-native';

<View style={{
  ...Platform.select({
    ios: { paddingTop: 20 },
    android: { paddingTop: 0 },
  }),
}} />
```

### 状态栏

```typescript
import { StatusBar } from 'expo-status-bar';

<StatusBar style={theme.isDark ? 'light' : 'dark'} />
```

## 性能优化

### 缓存样式计算

```typescript
import { useMemo } from 'react';

const MyComponent = () => {
  const theme = useTheme();

  const styles = useMemo(
    () => ({
      container: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
      },
    }),
    [theme]
  );

  return <View style={styles.container} />;
};
```

## 常见问题

### Q: 如何切换主题？

A: 默认跟随系统。如需强制切换，使用 ThemeService：

```typescript
import ThemeService from "@/services/theme-service";

const themeService = useService(ThemeService);
await themeService.setDarkMode();
await themeService.setLightMode();
await themeService.setAutoMode();
```

### Q: 如何添加自定义颜色？

A: 在 `constants/theme-colors.ts` 的 `Colors` 对象中添加：

```typescript
export const Colors = {
  light: {
    // ... 现有颜色
    customColor: "#your-color",
  },
  dark: {
    // ... 现有颜色
    customColor: "#your-dark-color",
  },
};
```

### Q: 如何确保触控友好？

A: 使用 `theme.touchTargets`：

```typescript
<TouchableOpacity
  style={{
    minHeight: theme.touchTargets.minHeight,
    minWidth: theme.touchTargets.minWidth,
  }}
/>
```

---

**更多详细信息**：

- [完整使用指南](./theme-system-guide.md)
- [与 Web 端对比](./theme-system-comparison.md)
