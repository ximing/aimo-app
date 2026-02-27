/**
 * Filter Drawer Component - 分类筛选抽屉
 * 从右侧滑入，提供分类筛选和排序功能
 *
 * 功能：
 * - 分类筛选（全部分类、无分类、用户自定义分类）
 * - 标签筛选（多选）
 * - 排序方式（按创建时间/编辑时间，从新到旧/从旧到新）
 * - 点击遮罩或选中后关闭
 *
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import { CreateCategoryModal } from "@/components/memos";
import type { SortField, SortOrder } from "@/services/filter-service";
import type { Category } from "@/types/category";
import type { TagDto } from "@/types/tag";
import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId: string | undefined;
  onSelectCategory: (categoryId: string | undefined) => void;
  tags: TagDto[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onChangeSort: (field: SortField, order: SortOrder) => void;
}

export const FilterDrawer = view(
  ({
    visible,
    onClose,
    categories,
    selectedCategoryId,
    onSelectCategory,
    tags,
    selectedTagIds,
    onToggleTag,
    sortField,
    sortOrder,
    onChangeSort,
  }: FilterDrawerProps) => {
    const theme = useTheme();
    // 新建分类 Modal 状态
    const [createModalVisible, setCreateModalVisible] = useState(false);
    // 下拉框显示状态
    const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
    const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
    // 动画值
    const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // 触发动画
    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: DRAWER_WIDTH,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, translateX, opacity]);

    // 处理分类选择
    const handleCategorySelect = (categoryId: string | undefined) => {
      onSelectCategory(categoryId);
      onClose();
    };

    // 处理排序字段切换
    const handleSortFieldChange = (field: SortField) => {
      onChangeSort(field, sortOrder);
    };

    // 处理排序方向切换
    const handleSortOrderChange = (order: SortOrder) => {
      onChangeSort(sortField, order);
    };

    // 获取分类的显示名称
    const getCategoryDisplayName = (categoryId: string | undefined): string => {
      if (categoryId === undefined) {
        return "全部分类";
      }
      if (categoryId === "__uncategorized__") {
        return "无分类";
      }
      const category = categories.find((c) => c.categoryId === categoryId);
      return category?.name || "未知分类";
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          {/* 背景遮罩 */}
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity,
                backgroundColor: theme.colors.overlay,
              },
            ]}
          >
            <Pressable style={styles.backdropPressable} onPress={onClose} />
          </Animated.View>

          {/* 抽屉内容 */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                backgroundColor: theme.colors.background,
                width: DRAWER_WIDTH,
                transform: [{ translateX }],
              },
            ]}
          >
            {/* 标题栏 */}
            <View style={styles.header}>
              <Text
                style={[styles.headerTitle, { color: theme.colors.foreground }]}
              >
                筛选与排序
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.foreground}
                />
              </TouchableOpacity>
            </View>

            {/* 下拉框遮罩层 - 点击关闭所有下拉框 */}
            {(categoryDropdownVisible || sortDropdownVisible) && (
              <Pressable
                style={styles.dropdownOverlay}
                onPress={() => {
                  setCategoryDropdownVisible(false);
                  setSortDropdownVisible(false);
                }}
              />
            )}

            {/* 分类区域 */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                分类
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
                onPress={() => setCategoryDropdownVisible(!categoryDropdownVisible)}
              >
                <View style={styles.dropdownButtonContent}>
                  <MaterialIcons
                    name="folder"
                    size={18}
                    color={theme.colors.foregroundSecondary}
                  />
                  <Text
                    style={[styles.dropdownButtonText, { color: theme.colors.foreground }]}
                  >
                    {getCategoryDisplayName(selectedCategoryId)}
                  </Text>
                </View>
                <MaterialIcons
                  name={categoryDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={20}
                  color={theme.colors.foregroundTertiary}
                />
              </TouchableOpacity>

              {/* 分类下拉展开 */}
              {categoryDropdownVisible && (
                <View
                  style={[
                    styles.inlineDropdown,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.inlineDropdownItem,
                      selectedCategoryId === undefined && {
                        backgroundColor: theme.colors.primary + "15",
                      },
                    ]}
                    onPress={() => {
                      handleCategorySelect(undefined);
                      setCategoryDropdownVisible(false);
                    }}
                  >
                    <MaterialIcons
                      name="folder-open"
                      size={18}
                      color={
                        selectedCategoryId === undefined
                          ? theme.colors.primary
                          : theme.colors.foregroundSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.inlineDropdownItemText,
                        {
                          color:
                            selectedCategoryId === undefined
                              ? theme.colors.primary
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      全部分类
                    </Text>
                    {selectedCategoryId === undefined && (
                      <MaterialIcons name="check" size={18} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.inlineDropdownItem,
                      selectedCategoryId === "__uncategorized__" && {
                        backgroundColor: theme.colors.primary + "15",
                      },
                    ]}
                    onPress={() => {
                      handleCategorySelect("__uncategorized__");
                      setCategoryDropdownVisible(false);
                    }}
                  >
                    <MaterialIcons
                      name="folder"
                      size={18}
                      color={
                        selectedCategoryId === "__uncategorized__"
                          ? theme.colors.primary
                          : theme.colors.foregroundSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.inlineDropdownItemText,
                        {
                          color:
                            selectedCategoryId === "__uncategorized__"
                              ? theme.colors.primary
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      无分类
                    </Text>
                    {selectedCategoryId === "__uncategorized__" && (
                      <MaterialIcons name="check" size={18} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.categoryId}
                      style={[
                        styles.inlineDropdownItem,
                        selectedCategoryId === category.categoryId && {
                          backgroundColor: theme.colors.primary + "15",
                        },
                      ]}
                      onPress={() => {
                        handleCategorySelect(category.categoryId);
                        setCategoryDropdownVisible(false);
                      }}
                    >
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor:
                              category.color || theme.colors.foregroundSecondary,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.inlineDropdownItemText,
                          {
                            color:
                              selectedCategoryId === category.categoryId
                                ? theme.colors.primary
                                : theme.colors.foreground,
                          },
                        ]}
                      >
                        {category.name}
                      </Text>
                      {selectedCategoryId === category.categoryId && (
                        <MaterialIcons name="check" size={18} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.inlineDropdownItem, styles.addCategoryInlineItem]}
                    onPress={() => {
                      setCategoryDropdownVisible(false);
                      setCreateModalVisible(true);
                    }}
                  >
                    <MaterialIcons name="add" size={18} color={theme.colors.primary} />
                    <Text style={[styles.inlineDropdownItemText, { color: theme.colors.primary }]}>
                      新建分类
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 排序区域 */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                排序方式
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
                onPress={() => setSortDropdownVisible(!sortDropdownVisible)}
              >
                <View style={styles.dropdownButtonContent}>
                  <MaterialIcons
                    name="sort"
                    size={18}
                    color={theme.colors.foregroundSecondary}
                  />
                  <Text
                    style={[styles.dropdownButtonText, { color: theme.colors.foreground }]}
                  >
                    {sortField === "createdAt" ? "创建时间" : "编辑时间"}{" "}
                    {sortOrder === "desc" ? "从新到旧" : "从旧到新"}
                  </Text>
                </View>
                <MaterialIcons
                  name={sortDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={20}
                  color={theme.colors.foregroundTertiary}
                />
              </TouchableOpacity>

              {/* 排序下拉展开 */}
              {sortDropdownVisible && (
                <View
                  style={[
                    styles.inlineDropdown,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.inlineDropdownItem,
                      sortField === "createdAt" && sortOrder === "desc" && {
                        backgroundColor: theme.colors.primary + "15",
                      },
                    ]}
                    onPress={() => {
                      onChangeSort("createdAt", "desc");
                      setSortDropdownVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.inlineDropdownItemText,
                        {
                          color:
                            sortField === "createdAt" && sortOrder === "desc"
                              ? theme.colors.primary
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      创建时间 从新到旧
                    </Text>
                    {sortField === "createdAt" && sortOrder === "desc" && (
                      <MaterialIcons name="check" size={18} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.inlineDropdownItem,
                      sortField === "createdAt" && sortOrder === "asc" && {
                        backgroundColor: theme.colors.primary + "15",
                      },
                    ]}
                    onPress={() => {
                      onChangeSort("createdAt", "asc");
                      setSortDropdownVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.inlineDropdownItemText,
                        {
                          color:
                            sortField === "createdAt" && sortOrder === "asc"
                              ? theme.colors.primary
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      创建时间 从旧到新
                    </Text>
                    {sortField === "createdAt" && sortOrder === "asc" && (
                      <MaterialIcons name="check" size={18} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.inlineDropdownItem,
                      sortField === "updatedAt" && sortOrder === "desc" && {
                        backgroundColor: theme.colors.primary + "15",
                      },
                    ]}
                    onPress={() => {
                      onChangeSort("updatedAt", "desc");
                      setSortDropdownVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.inlineDropdownItemText,
                        {
                          color:
                            sortField === "updatedAt" && sortOrder === "desc"
                              ? theme.colors.primary
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      编辑时间 从新到旧
                    </Text>
                    {sortField === "updatedAt" && sortOrder === "desc" && (
                      <MaterialIcons name="check" size={18} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.inlineDropdownItem,
                      sortField === "updatedAt" && sortOrder === "asc" && {
                        backgroundColor: theme.colors.primary + "15",
                      },
                    ]}
                    onPress={() => {
                      onChangeSort("updatedAt", "asc");
                      setSortDropdownVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.inlineDropdownItemText,
                        {
                          color:
                            sortField === "updatedAt" && sortOrder === "asc"
                              ? theme.colors.primary
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      编辑时间 从旧到新
                    </Text>
                    {sortField === "updatedAt" && sortOrder === "asc" && (
                      <MaterialIcons name="check" size={18} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 标签区域 */}
            <View style={styles.section}>
              <View style={styles.tagHeaderRow}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.foregroundSecondary },
                  ]}
                >
                  标签
                </Text>
                {selectedTagIds.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearTagsButtonSmall}
                    onPress={() => selectedTagIds.forEach(id => onToggleTag(id))}
                  >
                    <Text style={[styles.clearTagsTextSmall, { color: theme.colors.destructive }]}>
                      清除
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 标签按名称排序 */}
              {(() => {
                const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
                return sortedTags.length === 0 ? (
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.foregroundTertiary },
                  ]}
                >
                  暂无标签
                </Text>
              ) : (
                <ScrollView
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  style={styles.tagContainer}
                >
                  <View style={styles.tagGrid}>
                    {sortedTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.tagId);
                      return (
                        <TouchableOpacity
                          key={tag.tagId}
                          style={[
                            styles.tagChip,
                            isSelected
                              ? { backgroundColor: theme.colors.primary + "20" }
                              : { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.border },
                          ]}
                          onPress={() => onToggleTag(tag.tagId)}
                        >
                          <Text
                            style={[
                              styles.tagChipText,
                              isSelected
                                ? { color: theme.colors.primary }
                                : { color: theme.colors.foregroundSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            #
                          </Text>
                          <Text
                            style={[
                              styles.tagChipText,
                              isSelected
                                ? { color: theme.colors.primary }
                                : { color: theme.colors.foreground },
                            ]}
                            numberOfLines={1}
                          >
                            {tag.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              );
              })()}
            </View>

            {/* 底部信息 */}
            <View style={styles.footer}>
              <Text
                style={[
                  styles.footerText,
                  { color: theme.colors.foregroundTertiary },
                ]}
              >
                已选择: {getCategoryDisplayName(selectedCategoryId)}
              </Text>
            </View>
          </Animated.View>

          {/* 新建分类弹窗 */}
          <CreateCategoryModal
            visible={createModalVisible}
            onClose={() => setCreateModalVisible(false)}
            onSuccess={(categoryId) => {
              onSelectCategory(categoryId);
              onClose();
            }}
          />
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    flex: 1,
  },
  drawerContainer: {
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  // 下拉框遮罩层
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clearTagsButtonSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearTagsTextSmall: {
    fontSize: 13,
    fontWeight: "500",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionItemSelected: {
    borderRadius: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
  },
  checkIcon: {
    marginLeft: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  addCategoryButton: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortOptionSelected: {
    borderWidth: 1,
  },
  sortOptionIcon: {
    marginRight: 4,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    marginTop: "auto",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
  tagContainer: {
    maxHeight: 150,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  tagChipSelected: {
    borderRadius: 16,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
    marginRight: 2,
  },
  // 下拉按钮样式
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 15,
    marginLeft: 10,
  },
  // 内联下拉框样式（悬浮）
  inlineDropdown: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "100%",
    zIndex: 20,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inlineDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  inlineDropdownItemText: {
    fontSize: 15,
    flex: 1,
  },
  addCategoryInlineItem: {
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
});
