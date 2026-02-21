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
  onSearch?: (query: string) => void;
  onFilterPress?: () => void;
}

export const SearchHeader = view(({ onDrawerToggle, onSearch, onFilterPress }: SearchHeaderProps) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  // 处理搜索提交
  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  // 处理输入变化
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
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
          <TouchableOpacity style={styles.menuButton} onPress={onDrawerToggle}>
            <MaterialIcons name="menu" size={24} color={theme.colors.foreground} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <MaterialIcons name="tune" size={22} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>

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
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                if (onSearch) {
                  onSearch("");
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="close"
                size={18}
                color={theme.colors.foregroundTertiary}
              />
            </TouchableOpacity>
          )}
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
    marginRight: 4,
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
