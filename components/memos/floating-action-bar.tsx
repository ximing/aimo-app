/**
 * Floating Action Bar Component - 底部浮动操作栏
 * 包含语音、新增、编辑按钮
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface FloatingActionBarProps {
  onMicPress?: () => void;
  onAddPress?: () => void;
  onEditPress?: () => void;
}

export const FloatingActionBar = ({
  onMicPress,
  onAddPress,
  onEditPress,
}: FloatingActionBarProps) => {
  const theme = useTheme();

  return (
    <View style={styles.floatingActionBarWrapper}>
      <View style={[styles.floatingActionBar, { 
        backgroundColor: theme.colors.card,
        ...theme.shadows.lg,
      }]}>
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
};

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
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 24,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
});
