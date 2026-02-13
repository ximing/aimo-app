/**
 * 主题系统演示页面
 *
 * 展示所有主题化组件和设计令牌的使用
 */

import { ThemedText } from "@/components/themed-text";
import {
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    Input,
} from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThemeDemoScreen() {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState("");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.xl,
        }}
      >
        {/* 标题 */}
        <View>
          <ThemedText type="title">主题系统演示</ThemedText>
          <ThemedText
            colorKey="foregroundSecondary"
            style={{ marginTop: theme.spacing.xs }}
          >
            当前模式: {theme.colorScheme}
          </ThemedText>
        </View>

        {/* 颜色系统 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">颜色系统</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.md }}>
              <ColorSwatch color={theme.colors.primary} label="Primary" />
              <ColorSwatch color={theme.colors.success} label="Success" />
              <ColorSwatch color={theme.colors.warning} label="Warning" />
              <ColorSwatch
                color={theme.colors.destructive}
                label="Destructive"
              />
              <ColorSwatch color={theme.colors.info} label="Info" />
            </View>
          </CardContent>
        </Card>

        {/* 按钮变体 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">按钮变体</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.md }}>
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </View>
          </CardContent>
        </Card>

        {/* 按钮尺寸 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">按钮尺寸</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.md }}>
              <Button size="sm">Small Button</Button>
              <Button size="md">Medium Button</Button>
              <Button size="lg">Large Button</Button>
            </View>
          </CardContent>
        </Card>

        {/* 按钮状态 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">按钮状态</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.md }}>
              <Button loading>Loading...</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width Button</Button>
            </View>
          </CardContent>
        </Card>

        {/* 文本类型 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">文本类型</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.sm }}>
              <ThemedText type="title">标题文本 (Title)</ThemedText>
              <ThemedText type="subtitle">副标题 (Subtitle)</ThemedText>
              <ThemedText type="default">默认文本 (Default)</ThemedText>
              <ThemedText type="caption">说明文本 (Caption)</ThemedText>
              <ThemedText type="semibold">半粗体文本 (Semibold)</ThemedText>
              <ThemedText type="bold">粗体文本 (Bold)</ThemedText>
              <ThemedText type="link">链接文本 (Link)</ThemedText>
            </View>
          </CardContent>
        </Card>

        {/* 输入框 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">输入框</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.md }}>
              <Input
                label="用户名"
                placeholder="请输入用户名"
                value={inputValue}
                onChangeText={setInputValue}
              />
              <Input label="密码" placeholder="请输入密码" secureTextEntry />
              <Input
                label="错误示例"
                placeholder="输入框"
                error="这是一个错误提示"
              />
              <Input
                label="禁用状态"
                placeholder="禁用的输入框"
                editable={false}
              />
            </View>
          </CardContent>
        </Card>

        {/* 卡片样式 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">卡片样式</ThemedText>
          </CardHeader>
          <CardContent>
            <ThemedText>这是一个标准卡片，带阴影</ThemedText>
          </CardContent>
          <CardFooter>
            <Button size="sm">操作</Button>
          </CardFooter>
        </Card>

        <Card shadow={false} bordered>
          <CardContent>
            <ThemedText>这是一个带边框的卡片，无阴影</ThemedText>
          </CardContent>
        </Card>

        {/* 间距示例 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">间距系统</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.md }}>
              <SpacingDemo size={theme.spacing.xs} label="XS (4)" />
              <SpacingDemo size={theme.spacing.sm} label="SM (8)" />
              <SpacingDemo size={theme.spacing.md} label="MD (12)" />
              <SpacingDemo size={theme.spacing.lg} label="LG (16)" />
              <SpacingDemo size={theme.spacing.xl} label="XL (20)" />
            </View>
          </CardContent>
        </Card>

        {/* 圆角示例 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">圆角系统</ThemedText>
          </CardHeader>
          <CardContent>
            <View
              style={{
                gap: theme.spacing.md,
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              <BorderRadiusDemo radius={theme.borderRadius.sm} label="SM" />
              <BorderRadiusDemo radius={theme.borderRadius.md} label="MD" />
              <BorderRadiusDemo radius={theme.borderRadius.lg} label="LG" />
              <BorderRadiusDemo radius={theme.borderRadius.xl} label="XL" />
              <BorderRadiusDemo
                radius={theme.borderRadius["2xl"]}
                label="2XL"
              />
              <BorderRadiusDemo radius={theme.borderRadius.full} label="Full" />
            </View>
          </CardContent>
        </Card>

        {/* 阴影示例 */}
        <Card>
          <CardHeader>
            <ThemedText type="subtitle">阴影系统</ThemedText>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.lg }}>
              <ShadowDemo
                shadow={theme.shadows?.sm}
                label="Small"
                theme={theme}
              />
              <ShadowDemo
                shadow={theme.shadows?.md}
                label="Medium"
                theme={theme}
              />
              <ShadowDemo
                shadow={theme.shadows?.lg}
                label="Large"
                theme={theme}
              />
              <ShadowDemo shadow={theme.shadows?.xl} label="XL" theme={theme} />
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// 辅助组件
function ColorSwatch({ color, label }: { color: string; label: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: color,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      />
      <View style={{ flex: 1 }}>
        <ThemedText type="semibold">{label}</ThemedText>
        <ThemedText type="caption" colorKey="foregroundSecondary">
          {color}
        </ThemedText>
      </View>
    </View>
  );
}

function SpacingDemo({ size, label }: { size: number; label: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: size,
          height: 20,
          backgroundColor: theme.colors.primary,
          borderRadius: 2,
        }}
      />
      <ThemedText type="caption">{label}</ThemedText>
    </View>
  );
}

function BorderRadiusDemo({
  radius,
  label,
}: {
  radius: number;
  label: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", gap: theme.spacing.xs }}>
      <View
        style={{
          width: 60,
          height: 60,
          backgroundColor: theme.colors.primary,
          borderRadius: radius,
        }}
      />
      <ThemedText type="caption">{label}</ThemedText>
    </View>
  );
}

function ShadowDemo({
  shadow,
  label,
  theme,
}: {
  shadow: any;
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={[
        {
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.md,
        },
        shadow,
      ]}
    >
      <ThemedText>{label} Shadow</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
