/**
 * Filter Service - 筛选状态管理服务
 *
 * 管理 memo 列表的筛选和排序状态，支持持久化到 AsyncStorage
 *
 * 功能：
 * - 分类筛选（全部分类、无分类、特定分类）
 * - 标签筛选（多选）
 * - 排序字段（创建时间、编辑时间）
 * - 排序方向（从新到旧、从旧到新）
 * - 持久化筛选偏好
 */

import { Service } from '@rabjs/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTER_PREFS_STORAGE_KEY = 'memoFilterPrefs';

export type SortField = 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface FilterPrefs {
  selectedCategoryId: string | undefined;
  selectedTags: string[]; // 选中的标签ID数组
  sortField: SortField;
  sortOrder: SortOrder;
}

class FilterService extends Service {
  /**
   * 当前选中的分类 ID
   * - undefined: 全部分类
   * - '__uncategorized__': 无分类
   * - string: 特定分类 ID
   */
  selectedCategoryId: string | undefined = undefined;

  /**
   * 选中的标签 ID 数组（多选）
   */
  selectedTags: string[] = [];

  /**
   * 排序字段
   * - 'createdAt': 按创建时间排序
   * - 'updatedAt': 按编辑时间排序
   */
  sortField: SortField = 'createdAt';

  /**
   * 排序方向
   * - 'desc': 从新到旧（降序）
   * - 'asc': 从旧到新（升序）
   */
  sortOrder: SortOrder = 'desc';

  /**
   * 是否已初始化
   */
  initialized = false;

  /**
   * 初始化：从 AsyncStorage 加载筛选偏好
   */
  async loadFilterPrefs(): Promise<void> {
    try {
      const savedPrefs = await AsyncStorage.getItem(FILTER_PREFS_STORAGE_KEY);
      if (savedPrefs) {
        const prefs: FilterPrefs = JSON.parse(savedPrefs);
        this.selectedCategoryId = prefs.selectedCategoryId;
        this.selectedTags = Array.isArray(prefs.selectedTags) ? prefs.selectedTags : [];
        this.sortField = this.isValidSortField(prefs.sortField) ? prefs.sortField : 'createdAt';
        this.sortOrder = this.isValidSortOrder(prefs.sortOrder) ? prefs.sortOrder : 'desc';
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load filter preferences:', error);
      // 使用默认值
      this.resetToDefaults();
      this.initialized = true;
    }
  }

  /**
   * 保存筛选偏好到 AsyncStorage
   */
  async saveFilterPrefs(): Promise<void> {
    try {
      const prefs: FilterPrefs = {
        selectedCategoryId: this.selectedCategoryId,
        selectedTags: this.selectedTags,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
      };
      await AsyncStorage.setItem(FILTER_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save filter preferences:', error);
    }
  }

  /**
   * 设置选中的分类
   * @param categoryId - 分类 ID，undefined 表示全部分类，'__uncategorized__' 表示无分类
   */
  async setSelectedCategory(categoryId: string | undefined): Promise<void> {
    this.selectedCategoryId = categoryId;
    await this.saveFilterPrefs();
  }

  /**
   * 切换标签选中状态
   * @param tagId - 标签 ID
   */
  async toggleTag(tagId: string): Promise<void> {
    const index = this.selectedTags.indexOf(tagId);
    if (index === -1) {
      this.selectedTags = [...this.selectedTags, tagId];
    } else {
      this.selectedTags = this.selectedTags.filter(id => id !== tagId);
    }
    await this.saveFilterPrefs();
  }

  /**
   * 设置选中的标签（多选）
   * @param tagIds - 标签 ID 数组
   */
  async setSelectedTags(tagIds: string[]): Promise<void> {
    this.selectedTags = tagIds;
    await this.saveFilterPrefs();
  }

  /**
   * 清除所有选中的标签
   */
  async clearSelectedTags(): Promise<void> {
    this.selectedTags = [];
    await this.saveFilterPrefs();
  }

  /**
   * 获取标签筛选参数的 API 字符串（逗号分隔）
   */
  get tagsParam(): string {
    return this.selectedTags.length > 0 ? this.selectedTags.join(',') : '';
  }

  /**
   * 判断是否有标签被选中
   */
  get hasTagsSelected(): boolean {
    return this.selectedTags.length > 0;
  }

  /**
   * 设置排序字段
   * @param field - 'createdAt' 或 'updatedAt'
   */
  async setSortField(field: SortField): Promise<void> {
    this.sortField = field;
    await this.saveFilterPrefs();
  }

  /**
   * 设置排序方向
   * @param order - 'asc' 或 'desc'
   */
  async setSortOrder(order: SortOrder): Promise<void> {
    this.sortOrder = order;
    await this.saveFilterPrefs();
  }

  /**
   * 设置完整的排序选项
   * @param field - 排序字段
   * @param order - 排序方向
   */
  async setSortOption(field: SortField, order: SortOrder): Promise<void> {
    this.sortField = field;
    this.sortOrder = order;
    await this.saveFilterPrefs();
  }

  /**
   * 重置为默认筛选状态
   */
  async resetToDefaults(): Promise<void> {
    this.selectedCategoryId = undefined;
    this.selectedTags = [];
    this.sortField = 'createdAt';
    this.sortOrder = 'desc';
    await this.saveFilterPrefs();
  }

  /**
   * 判断是否是无分类筛选
   */
  get isUncategorizedSelected(): boolean {
    return this.selectedCategoryId === '__uncategorized__';
  }

  /**
   * 判断是否是全部分类
   */
  get isAllCategoriesSelected(): boolean {
    return this.selectedCategoryId === undefined;
  }

  /**
   * 获取当前筛选条件的显示名称
   */
  get filterDisplayName(): string {
    const parts: string[] = [];

    if (this.hasTagsSelected) {
      parts.push(`${this.selectedTags.length}个标签`);
    }

    if (this.isAllCategoriesSelected) {
      // categories = '全部分类'
    } else if (this.isUncategorizedSelected) {
      parts.push('无分类');
    } else {
      parts.push('特定分类');
    }

    return parts.length > 0 ? parts.join(' · ') : '全部分类';
  }

  /**
   * 获取排序选项的显示名称
   */
  get sortDisplayName(): string {
    const fieldName = this.sortField === 'createdAt' ? '创建时间' : '编辑时间';
    const orderName = this.sortOrder === 'desc' ? '从新到旧' : '从旧到新';
    return `${fieldName} · ${orderName}`;
  }

  /**
   * 验证排序字段是否有效
   */
  private isValidSortField(field: string): field is SortField {
    return field === 'createdAt' || field === 'updatedAt';
  }

  /**
   * 验证排序方向是否有效
   */
  private isValidSortOrder(order: string): order is SortOrder {
    return order === 'asc' || order === 'desc';
  }
}

export default FilterService;
