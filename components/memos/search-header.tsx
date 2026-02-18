/**
 * Search Header Component - 搜索头部
 * 包含菜单按钮、搜索框、礼物按钮
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SearchHeaderProps {
  onDrawerToggle: () => void;
}

export const SearchHeader = view(({ onDrawerToggle }: SearchHeaderProps) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

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
        <TouchableOpacity style={styles.menuButton} onPress={onDrawerToggle}>
          <MaterialIcons name="menu" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>

        {/* 搜索输入框 */}
        <View
          style={[
            styles.searchContainer,
            { 
              backgroundColor: theme.colors.card,
            },
          ]}
        >
          <MaterialIcons
            name="search"
            size={18}
            color={theme.colors.foregroundTertiary}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.foreground }]}
            placeholder="搜索笔记"
            placeholderTextColor={theme.colors.foregroundTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <MaterialIcons name="mic" size={18} color={theme.colors.info} />
        </View>
      </View>
    </View>
  );
});

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
  menuButton: {
    padding: 8,
    marginRight: 8,
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
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
});
