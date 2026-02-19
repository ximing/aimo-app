/**
 * Floating Action Bar Component - 底部浮动操作栏
 * 包含语音、新增、编辑按钮
 * 使用 @rabjs/react 的 view 装饰器以响应主题变化
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import { view } from "@rabjs/react";
import { useRouter } from "expo-router";
import { FileText, Mic, MoreHorizontal } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FloatingActionBarProps {
  onMicPress?: () => void;
  onAddPress?: () => void;
  onMorePress?: () => void;
}

export const FloatingActionBar = view(
  ({ onMicPress, onAddPress, onMorePress }: FloatingActionBarProps) => {
    const theme = useTheme();
    const router = useRouter();

    const handleAddPress = React.useCallback(() => {
      if (onAddPress) {
        onAddPress();
      } else {
        // 默认行为：导航到创建页面
        router.push("/(memos)/create");
      }
    }, [onAddPress, router]);

    return (
      <View style={styles.floatingActionBarWrapper}>
        <View
          style={[
            styles.floatingActionBar,
            {
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...theme.shadows.lg,
            },
          ]}
        >
          <TouchableOpacity style={styles.actionButton} onPress={onMicPress}>
            <Mic size={18} color={theme.colors.foreground} />
            <Text
              style={[styles.actionLabel, { color: theme.colors.foreground }]}
            >
              录音
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddPress}
          >
            <FileText size={18} color={theme.colors.foreground} />
            <Text
              style={[styles.actionLabel, { color: theme.colors.foreground }]}
            >
              文本
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onMorePress}>
            <MoreHorizontal size={18} color={theme.colors.foreground} />
            <Text
              style={[styles.actionLabel, { color: theme.colors.foreground }]}
            >
              更多
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  floatingActionBarWrapper: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 100,
    pointerEvents: "box-none",
    marginHorizontal: 30,
  },
  floatingActionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignSelf: "center",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  actionLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
