/**
 * Filter Service - 筛选状态管理服务
 *
 * 管理 memo 列表的筛选和排序状态，支持持久化到 AsyncStorage
 *
 * 功能：
 * - 分类筛选（全部分类、无分类、特定分类）
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
   * 初始化：从 AsyncStorage 加载筛选偏好
   */
  async loadFilterPrefs(): Promise<void> {
    try {
      const savedPrefs = await AsyncStorage.getItem(FILTER_PREFS_STORAGE_KEY);
      if (savedPrefs) {
        const prefs: FilterPrefs = JSON.parse(savedPrefs);
        this.selectedCategoryId = prefs.selectedCategoryId;
        this.sortField = this.isValidSortField(prefs.sortField) ? prefs.sortField : 'createdAt';
        this.sortOrder = this.isValidSortOrder(prefs.sortOrder) ? prefs.sortOrder : 'desc';
      }
    } catch (error) {
      console.error('Failed to load filter preferences:', error);
      // 使用默认值
      this.resetToDefaults();
    }
  }

  /**
   * 保存筛选偏好到 AsyncStorage
   */
  async saveFilterPrefs(): Promise<void> {
    try {
      const prefs: FilterPrefs = {
        selectedCategoryId: this.selectedCategoryId,
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
    if (this.isAllCategoriesSelected) {
      return '全部分类';
    }
    if (this.isUncategorizedSelected) {
      return '无分类';
    }
    return '特定分类';
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
