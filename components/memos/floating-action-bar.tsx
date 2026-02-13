/**
 * Floating Action Bar Component - 底部浮动操作栏
 * 包含语音、新增、编辑按钮
 * 使用 @rabjs/react 的 view 装饰器以响应主题变化
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface FloatingActionBarProps {
  onMicPress?: () => void;
  onAddPress?: () => void;
  onEditPress?: () => void;
}

export const FloatingActionBar = view(({
  onMicPress,
  onAddPress,
  onEditPress,
}: FloatingActionBarProps) => {
  const theme = useTheme();

  return (
    <View style={styles.floatingActionBarWrapper}>
      <View
        style={[
          styles.floatingActionBar,
          {
            // 使用 backgroundTertiary 以与卡片形成对比
            // 浅色模式：#f3f4f6（与白色卡片 #ffffff 对比）
            // 深色模式：使用 input (#3f3f46) 以区分于卡片 (#262626)
            backgroundColor: theme.isDark ? theme.colors.input : theme.colors.backgroundTertiary,
            // 深色模式下增加微弱边框以增强区分度
            borderWidth: theme.isDark ? 1 : 0,
            borderColor: theme.colors.border,
            ...theme.shadows.lg,
          },
        ]}
      >
        <TouchableOpacity style={styles.actionButton} onPress={onMicPress}>
          <MaterialIcons name="mic" size={24} color={theme.colors.info} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onAddPress}>
          <MaterialIcons name="add" size={28} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onEditPress}>
          <MaterialIcons name="edit" size={24} color={theme.colors.info} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  floatingActionBarWrapper: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 100,
    pointerEvents: "box-none",
  },
  floatingActionBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 50, // 50% 圆角
    alignSelf: "center",
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
