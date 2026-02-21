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
import React, { useEffect, useRef, useCallback, useState } from "react";
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
import { MemoItem } from "@/components/memos/memo-item";
import { DateFilterDropdown, CategoryFilterDropdown } from "@/components/memos";
import CategoryService from "@/services/category-service";
import SearchService from "@/services/search-service";
import type { DateFilterOption, DateRange } from "@/components/memos/date-filter-dropdown";

const SearchPageContent = () => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchService = useService(SearchService);
  const categoryService = useService(CategoryService);
  const inputRef = useRef<TextInput>(null);

  // 筛选状态
  const [dateFilterOption, setDateFilterOption] = useState<DateFilterOption>("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

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

  // 处理日期筛选变化
  const handleDateFilterChange = useCallback(
    (option: DateFilterOption, range?: DateRange) => {
      setDateFilterOption(option);
      setCustomDateRange(range);

      // 更新 SearchService 的筛选条件
      searchService.setSearchFilters({
        ...searchService.searchFilters,
        dateRange: range,
      });

      // 如果已有搜索关键词，立即触发搜索
      if (searchService.searchKeyword.trim()) {
        searchService.search(searchService.searchKeyword, {
          ...searchService.searchFilters,
          dateRange: range,
        });
      }
    },
    [searchService]
  );

  // 处理分类筛选变化
  const handleCategoryFilterChange = useCallback(
    (categoryId: string | undefined) => {
      // 更新 SearchService 的筛选条件
      searchService.setSearchFilters({
        ...searchService.searchFilters,
        categoryId,
      });

      // 如果已有搜索关键词，立即触发搜索
      if (searchService.searchKeyword.trim()) {
        searchService.search(searchService.searchKeyword, {
          ...searchService.searchFilters,
          categoryId,
        });
      }
    },
    [searchService]
  );

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

  // 渲染列表底部加载指示器
  const renderFooter = useCallback(() => {
    if (!searchService.isSearching || searchService.searchResults.length === 0) {
      return null;
    }

    return (
      <View style={styles.footerLoading}>
        <MaterialIcons
          name="refresh"
          size={20}
          color={theme.colors.foregroundTertiary}
          style={{ transform: [{ rotate: '45deg' }] }}
        />
        <Text style={[styles.footerText, { color: theme.colors.foregroundTertiary }]}>
          加载中...
        </Text>
      </View>
    );
  }, [searchService.isSearching, searchService.searchResults.length, theme]);

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
            style={[styles.emptyText, { color: theme.colors.foregroundTertiary }]}
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

      {/* 搜索加载指示器 */}
      {searchService.isSearching && searchService.searchResults.length === 0 && (
        <View style={styles.loadingContainer}>
          <MaterialIcons
            name="refresh"
            size={32}
            color={theme.colors.foregroundTertiary}
            style={{ transform: [{ rotate: '45deg' }] }}
          />
          <Text style={[styles.loadingText, { color: theme.colors.foregroundTertiary }]}>
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
        refreshing={searchService.isSearching && searchService.searchResults.length > 0}
        onRefresh={() => {
          if (searchService.searchKeyword.trim()) {
            handleSearch(searchService.searchKeyword);
          }
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  footerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
});
