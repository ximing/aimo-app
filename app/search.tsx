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
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryFilterDropdown, DateFilterDropdown } from "@/components/memos";
import type {
  DateFilterOption,
  DateRange,
} from "@/components/memos/date-filter-dropdown";
import { MemoItem } from "@/components/memos/memo-item";
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

  // 筛选状态
  const [dateFilterOption, setDateFilterOption] =
    useState<DateFilterOption>("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(
    undefined,
  );

  // 初始化加载最近搜索历史和分类
  useEffect(() => {
    searchService.loadRecentSearches();
    categoryService.initialize();
  }, [searchService, categoryService]);

  // 自动聚焦搜索框
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 处理返回
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 处理日期筛选变化
  const handleDateFilterChange = useCallback(
    (option: DateFilterOption, range?: DateRange) => {
      setDateFilterOption(option);
      setCustomDateRange(range);
      searchService.updateDateFilter(range);
    },
    [searchService],
  );

  // 处理分类筛选变化
  const handleCategoryFilterChange = useCallback(
    (categoryId: string | undefined) => {
      searchService.updateCategoryFilter(categoryId);
    },
    [searchService],
  );

  // 渲染最近搜索 Tag
  const renderRecentSearchTag = useCallback(
    (item: string) => (
      <TouchableOpacity
        key={item}
        style={[styles.recentTag, { backgroundColor: theme.colors.card }]}
        onPress={() => searchService.searchFromRecent(item)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="history"
          size={14}
          color={theme.colors.foregroundSecondary}
        />
        <Text
          style={[styles.recentTagText, { color: theme.colors.foreground }]}
          numberOfLines={1}
        >
          {item}
        </Text>
        <TouchableOpacity
          onPress={() => searchService.removeRecentSearch(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <MaterialIcons
            name="close"
            size={14}
            color={theme.colors.foregroundTertiary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [theme, searchService],
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
            <TouchableOpacity onPress={searchService.clearRecentSearches}>
              <Text
                style={[styles.clearAllText, { color: theme.colors.primary }]}
              >
                清除全部
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentTagsContainer}>
            {searchService.recentSearches.map(renderRecentSearchTag)}
          </View>
        </View>
      )}

      {/* 筛选栏 */}
      <View style={styles.filterBar}>
        <DateFilterDropdown
          selectedOption={dateFilterOption}
          customRange={customDateRange}
          onSelectOption={handleDateFilterChange}
        />
        <CategoryFilterDropdown
          categories={categoryService.categories}
          selectedCategoryId={searchService.searchFilters.categoryId}
          onSelectCategory={handleCategoryFilterChange}
        />
      </View>
    </>
  );

  // 处理加载更多
  const handleLoadMore = useCallback(async () => {
    console.log(
      "searchService.hasMore && !searchService.isSearching",
      searchService.hasMore,
      !searchService.isSearching,
    );
    if (searchService.hasMore && !searchService.isSearching) {
      await searchService.loadNextPage();
    }
  }, [searchService]);

  // 渲染搜索结果项
  const renderSearchResult = useCallback(
    ({ item }: { item: import("@/types/memo").Memo }) => (
      <MemoItem
        memo={item}
        onPress={(memoId: string) => {
          router.push(`/(memos)/${memoId}`);
        }}
      />
    ),
    [router],
  );

  // 渲染列表底部（加载中 / 加载完成提示）
  const renderFooter = useCallback(() => {
    // 加载中状态
    if (searchService.isSearching && searchService.searchResults.length > 0) {
      return (
        <View style={styles.footerLoading}>
          <MaterialIcons
            name="refresh"
            size={20}
            color={theme.colors.foregroundTertiary}
            style={{ transform: [{ rotate: "45deg" }] }}
          />
          <Text
            style={[
              styles.footerText,
              { color: theme.colors.foregroundTertiary },
            ]}
          >
            加载中...
          </Text>
        </View>
      );
    }

    // 搜索完成且没有更多数据时，显示"已加载全部"
    if (
      !searchService.isSearching &&
      searchService.searchResults.length > 0 &&
      !searchService.hasMore
    ) {
      return (
        <View style={styles.footerLoaded}>
          <MaterialIcons
            name="check-circle"
            size={16}
            color={theme.colors.foregroundTertiary}
          />
          <Text
            style={[
              styles.footerLoadedText,
              { color: theme.colors.foregroundTertiary },
            ]}
          >
            已加载全部
          </Text>
        </View>
      );
    }

    return null;
  }, [
    searchService.isSearching,
    searchService.searchResults.length,
    searchService.hasMore,
    theme,
  ]);

  // 渲染空状态
  const renderEmpty = useCallback(() => {
    // 如果有搜索关键词但没有结果，显示"未找到相关笔记"
    if (searchService.searchKeyword.trim() && !searchService.isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="search-off"
            size={64}
            color={theme.colors.foregroundQuaternary}
          />
          <Text
            style={[
              styles.emptyText,
              { color: theme.colors.foregroundTertiary },
            ]}
          >
            未找到相关笔记
          </Text>
        </View>
      );
    }

    // 初始状态显示"输入关键词开始搜索"
    return (
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
  }, [searchService.searchKeyword, searchService.isSearching, theme]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
            style={[styles.searchInput, { color: theme.colors.foreground }]}
            placeholder="搜索笔记..."
            placeholderTextColor={theme.colors.foregroundTertiary}
            value={searchService.searchKeyword}
            onChangeText={searchService.setSearchKeyword}
            onSubmitEditing={searchService.submitSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchService.searchKeyword.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                searchService.setSearchKeyword("");
                inputRef.current?.focus();
              }}
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

      {/* 搜索加载指示器 */}
      {searchService.isSearching &&
        searchService.searchResults.length === 0 && (
          <View style={styles.loadingContainer}>
            <MaterialIcons
              name="refresh"
              size={32}
              color={theme.colors.foregroundTertiary}
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text
              style={[
                styles.loadingText,
                { color: theme.colors.foregroundTertiary },
              ]}
            >
              搜索中...
            </Text>
          </View>
        )}

      {/* 内容区域 */}
      <FlatList
        data={searchService.searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.memoId}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
        ]}
        refreshing={
          searchService.isSearching && searchService.searchResults.length > 0
        }
        onRefresh={searchService.submitSearch}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default bindServices(SearchPageContent, [
  SearchService,
  CategoryService,
]);

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
  recentTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recentTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  recentTagText: {
    fontSize: 13,
    maxWidth: 150,
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
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
  loadingContainer: {
    position: "absolute",
    top: 200,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  footerLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLoaded: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 6,
  },
  footerLoadedText: {
    fontSize: 13,
  },
});
