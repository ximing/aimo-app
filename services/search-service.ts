/**
 * Search Service - 搜索状态和最近搜索历史管理服务
 *
 * 管理搜索页面的状态，包括搜索关键词、搜索结果、搜索历史和筛选条件
 *
 * 功能：
 * - 搜索关键词管理
 * - 搜索结果列表
 * - 搜索加载状态
 * - 最近搜索历史（持久化到 AsyncStorage，最多10条）
 * - 搜索筛选条件（分类、日期范围）
 */

import { Service } from '@rabjs/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Memo } from '@/types/memo';

const RECENT_SEARCHES_STORAGE_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 10;

export interface SearchFilters {
  /** 分类ID，undefined表示全部分类 */
  categoryId?: string;
  /** 日期范围 */
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult {
  items: Memo[];
  total: number;
  page: number;
  hasMore: boolean;
}

class SearchService extends Service {
  /** 搜索关键词 */
  searchKeyword = '';

  /** 搜索结果列表 */
  searchResults: Memo[] = [];

  /** 搜索总数量 */
  searchTotal = 0;

  /** 是否正在搜索 */
  isSearching = false;

  /** 搜索错误信息 */
  searchError: string | null = null;

  /** 最近搜索历史 */
  recentSearches: string[] = [];

  /** 当前搜索页码 */
  currentPage = 1;

  /** 每页数量 */
  pageSize = 20;

  /** 是否有更多结果 */
  hasMore = false;

  /** 搜索筛选条件 */
  searchFilters: SearchFilters = {};

  /**
   * 初始化：从 AsyncStorage 加载最近搜索历史
   */
  async loadRecentSearches(): Promise<void> {
    try {
      const savedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (savedSearches) {
        const searches: string[] = JSON.parse(savedSearches);
        this.recentSearches = searches.slice(0, MAX_RECENT_SEARCHES);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
      this.recentSearches = [];
    }
  }

  /**
   * 保存最近搜索历史到 AsyncStorage
   */
  private async saveRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify(this.recentSearches)
      );
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }

  /**
   * 添加最近搜索词
   * - 新搜索词插入到顶部
   * - 重复的去重，将旧的移到顶部
   * - 最多保留10条
   * @param keyword - 搜索关键词
   */
  async addRecentSearch(keyword: string): Promise<void> {
    if (!keyword || !keyword.trim()) return;

    const trimmedKeyword = keyword.trim();
    const existingIndex = this.recentSearches.indexOf(trimmedKeyword);

    if (existingIndex > -1) {
      // 如果已存在，移除旧的
      this.recentSearches.splice(existingIndex, 1);
    }

    // 插入到顶部
    this.recentSearches.unshift(trimmedKeyword);

    // 限制最多10条
    if (this.recentSearches.length > MAX_RECENT_SEARCHES) {
      this.recentSearches = this.recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }

    await this.saveRecentSearches();
  }

  /**
   * 删除单条最近搜索记录
   * @param keyword - 要删除的搜索关键词
   */
  async removeRecentSearch(keyword: string): Promise<void> {
    const index = this.recentSearches.indexOf(keyword);
    if (index > -1) {
      this.recentSearches.splice(index, 1);
      await this.saveRecentSearches();
    }
  }

  /**
   * 清空所有最近搜索历史
   */
  async clearRecentSearches(): Promise<void> {
    this.recentSearches = [];
    await this.saveRecentSearches();
  }

  /**
   * 设置搜索关键词
   * @param keyword - 搜索关键词
   */
  setSearchKeyword(keyword: string): void {
    this.searchKeyword = keyword;
  }

  /**
   * 设置搜索筛选条件
   * @param filters - 筛选条件
   */
  setSearchFilters(filters: Partial<SearchFilters>): void {
    this.searchFilters = { ...this.searchFilters, ...filters };
  }

  /**
   * 清除搜索筛选条件
   */
  clearSearchFilters(): void {
    this.searchFilters = {};
  }

  /**
   * 执行搜索
   * @param keyword - 搜索关键词（可选，默认使用当前的 searchKeyword）
   * @param filters - 搜索筛选条件（可选，默认使用当前的 searchFilters）
   */
  async search(keyword?: string, filters?: SearchFilters): Promise<void> {
    const searchKeyword = keyword?.trim() ?? this.searchKeyword;
    const searchFilters = filters ?? this.searchFilters;

    if (!searchKeyword) {
      this.searchResults = [];
      this.searchTotal = 0;
      this.hasMore = false;
      return;
    }

    this.isSearching = true;
    this.searchError = null;

    try {
      // 更新搜索关键词和筛选条件
      this.searchKeyword = searchKeyword;
      if (filters) {
        this.searchFilters = filters;
      }

      this.currentPage = 1;

      // TODO: 调用 API 搜索（US-012 中实现 searchMemos API）
      // 目前先使用本地模拟，等待 API 实现
      // const response = await searchMemos({
      //   keyword: searchKeyword,
      //   categoryId: searchFilters.categoryId,
      //   startDate: searchFilters.dateRange?.start?.toISOString(),
      //   endDate: searchFilters.dateRange?.end?.toISOString(),
      //   page: 1,
      //   limit: this.pageSize,
      // });

      // this.searchResults = response.items;
      // this.searchTotal = response.total;
      // this.hasMore = response.items.length === this.pageSize;

      // 添加到最近搜索历史
      await this.addRecentSearch(searchKeyword);
    } catch (error) {
      this.searchError = error instanceof Error ? error.message : '搜索失败';
      throw error;
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * 加载下一页搜索结果
   */
  async loadNextPage(): Promise<void> {
    if (!this.hasMore || this.isSearching || !this.searchKeyword) return;

    this.isSearching = true;
    this.searchError = null;

    try {
      const nextPage = this.currentPage + 1;

      // TODO: 调用 API 搜索下一页（US-012 中实现）
      // const response = await searchMemos({
      //   keyword: this.searchKeyword,
      //   categoryId: this.searchFilters.categoryId,
      //   startDate: this.searchFilters.dateRange?.start?.toISOString(),
      //   endDate: this.searchFilters.dateRange?.end?.toISOString(),
      //   page: nextPage,
      //   limit: this.pageSize,
      // });

      // this.searchResults.push(...response.items);
      // this.hasMore = response.items.length === this.pageSize;
      // this.currentPage = nextPage;
    } catch (error) {
      this.searchError = error instanceof Error ? error.message : '加载更多失败';
      throw error;
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * 清除搜索结果
   */
  clearSearchResults(): void {
    this.searchResults = [];
    this.searchTotal = 0;
    this.hasMore = false;
    this.currentPage = 1;
    this.searchError = null;
  }

  /**
   * 重置所有搜索状态
   */
  reset(): void {
    this.searchKeyword = '';
    this.searchResults = [];
    this.searchTotal = 0;
    this.isSearching = false;
    this.searchError = null;
    this.currentPage = 1;
    this.hasMore = false;
    this.searchFilters = {};
  }
}

export default SearchService;
