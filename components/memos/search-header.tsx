/**
 * Search Header Component - 搜索头部
 * 包含菜单按钮、搜索框、礼物按钮
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SearchHeaderProps {
  onDrawerToggle: () => void;
  onSearch?: (query: string) => void;
  onFilterPress?: () => void;
}

export const SearchHeader = view(
  ({ onDrawerToggle, onFilterPress }: SearchHeaderProps) => {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // 处理搜索框点击 - 跳转到搜索页面
    const handleSearchPress = () => {
      router.push("/search");
    };

    return (
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: theme.colors.background,
            paddingTop: Math.max(insets.top, theme.spacing.md),
          },
        ]}
      >
        <View style={styles.topBar}>
          <View style={styles.leftButtons}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={onDrawerToggle}
            >
              <MaterialIcons
                name="menu"
                size={24}
                color={theme.colors.foreground}
              />
            </TouchableOpacity>
          </View>

          {/* 搜索输入框 - 点击跳转到搜索页面 */}
          <TouchableOpacity
            style={[
              styles.searchContainer,
              {
                backgroundColor: theme.colors.card,
              },
            ]}
            onPress={handleSearchPress}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="search"
              size={18}
              color={theme.colors.foregroundTertiary}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.foreground }]}
              placeholder="搜索笔记..."
              placeholderTextColor={theme.colors.foregroundTertiary}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {/* 筛选按钮 - 搜索框右侧 */}
          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <MaterialIcons
              name="tune"
              size={22}
              color={theme.colors.foreground}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 8,
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
});
