/**
 * Search Page - 搜索页面
 *
 * 功能：
 * - 搜索输入框（真实可输入，自动聚焦）
 * - 最近搜索历史展示
 * - 筛选栏（日期、分类）
 * - 搜索结果列表
 * - 空状态提示
 */

import { MaterialIcons } from "@expo/vector-icons";
import { bindServices, useService } from "@rabjs/react";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/use-theme";
import CategoryService from "@/services/category-service";
import SearchService from "@/services/search-service";

const SearchPageContent = () => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchService = useService(SearchService);
  const categoryService = useService(CategoryService);
  const inputRef = useRef<TextInput>(null);

  // 初始化加载最近搜索历史和分类
  useEffect(() => {
    searchService.loadRecentSearches();
    categoryService.initialize();
  }, [searchService, categoryService]);

  // 自动聚焦搜索框
  useEffect(() => {
    // 延迟一点以确保页面加载完成
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 处理返回
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 处理搜索关键词变化
  const handleKeywordChange = useCallback(
    (text: string) => {
      searchService.setSearchKeyword(text);
    },
    [searchService],
  );

  // 处理清除输入
  const handleClear = useCallback(() => {
    searchService.setSearchKeyword("");
    inputRef.current?.focus();
  }, [searchService]);

  // 处理执行搜索
  const handleSearch = useCallback(
    async (keyword: string) => {
      if (!keyword.trim()) return;
      await searchService.search(keyword);
    },
    [searchService],
  );

  // 处理提交搜索（用户点击键盘上的搜索按钮）
  const handleSubmitEditing = useCallback(() => {
    if (searchService.searchKeyword.trim()) {
      handleSearch(searchService.searchKeyword);
    }
  }, [searchService.searchKeyword, handleSearch]);

  // 处理点击最近搜索词
  const handleRecentSearchPress = useCallback(
    (keyword: string) => {
      searchService.setSearchKeyword(keyword);
      handleSearch(keyword);
    },
    [searchService, handleSearch],
  );

  // 处理删除单条最近搜索
  const handleRemoveRecentSearch = useCallback(
    async (keyword: string) => {
      await searchService.removeRecentSearch(keyword);
    },
    [searchService],
  );

  // 处理清除全部最近搜索
  const handleClearAllRecent = useCallback(async () => {
    await searchService.clearRecentSearches();
  }, [searchService]);

  // 渲染最近搜索项
  const renderRecentSearchItem = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.recentItem}>
        <TouchableOpacity
          style={styles.recentItemContent}
          onPress={() => handleRecentSearchPress(item)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="history"
            size={20}
            color={theme.colors.foregroundSecondary}
          />
          <Text
            style={[styles.recentItemText, { color: theme.colors.foreground }]}
            numberOfLines={1}
          >
            {item}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recentItemDelete}
          onPress={() => handleRemoveRecentSearch(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name="close"
            size={18}
            color={theme.colors.foregroundTertiary}
          />
        </TouchableOpacity>
      </View>
    ),
    [
      theme,
      handleRecentSearchPress,
      handleRemoveRecentSearch,
    ],
  );

  // 渲染列表头部（最近搜索 + 筛选栏）
  const renderHeader = () => (
    <>
      {/* 最近搜索区域 */}
      {searchService.recentSearches.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text
              style={[
                styles.recentTitle,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              最近搜索
            </Text>
            <TouchableOpacity onPress={handleClearAllRecent}>
              <Text
                style={[
                  styles.clearAllText,
                  { color: theme.colors.primary },
                ]}
              >
                清除全部
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchService.recentSearches}
            renderItem={renderRecentSearchItem}
            keyExtractor={(item) => item}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* 筛选栏 */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <MaterialIcons
            name="calendar-today"
            size={18}
            color={theme.colors.foregroundSecondary}
          />
          <Text
            style={[
              styles.filterButtonText,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            日期
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={18}
            color={theme.colors.foregroundTertiary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <MaterialIcons
            name="folder"
            size={18}
            color={theme.colors.foregroundSecondary}
          />
          <Text
            style={[
              styles.filterButtonText,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            分类
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={18}
            color={theme.colors.foregroundTertiary}
          />
        </TouchableOpacity>
      </View>
    </>
  );

  // 渲染空状态
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="search"
        size={64}
        color={theme.colors.foregroundQuaternary}
      />
      <Text
        style={[styles.emptyText, { color: theme.colors.foregroundTertiary }]}
      >
        输入关键词开始搜索
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* 顶部搜索栏 */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, theme.spacing.md) + 8,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        {/* 返回按钮 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>

        {/* 搜索输入框 */}
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <MaterialIcons
            name="search"
            size={20}
            color={theme.colors.foregroundTertiary}
          />
          <TextInput
            ref={inputRef}
            style={[
              styles.searchInput,
              { color: theme.colors.foreground },
            ]}
            placeholder="搜索笔记..."
            placeholderTextColor={theme.colors.foregroundTertiary}
            value={searchService.searchKeyword}
            onChangeText={handleKeywordChange}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="search"
            autoFocus
          />
          {searchService.searchKeyword.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="cancel"
                size={20}
                color={theme.colors.foregroundTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 内容区域 */}
      <FlatList
        data={[]} // 搜索结果将在 US-011 中实现
        renderItem={() => null}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
        ]}
      />
    </View>
  );
};

export default bindServices(SearchPageContent, [SearchService, CategoryService]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 0,
  },
  content: {
    flexGrow: 1,
  },
  recentSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  clearAllText: {
    fontSize: 13,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  recentItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  recentItemText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
  },
  recentItemDelete: {
    padding: 4,
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  filterButtonText: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
