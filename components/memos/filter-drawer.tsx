/**
 * Filter Drawer Component - 分类筛选抽屉
 * 从右侧滑入，提供分类筛选和排序功能
 *
 * 功能：
 * - 分类筛选（全部分类、无分类、用户自定义分类）
 * - 排序方式（按创建时间/编辑时间，从新到旧/从旧到新）
 * - 点击遮罩或选中后关闭
 *
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import { CreateCategoryModal } from "@/components/memos";
import type { SortField, SortOrder } from "@/services/filter-service";
import type { Category } from "@/types/category";
import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
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
    sortField,
    sortOrder,
    onChangeSort,
  }: FilterDrawerProps) => {
    const theme = useTheme();
    // 新建分类 Modal 状态
    const [createModalVisible, setCreateModalVisible] = useState(false);
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

              {/* 全部分类选项 */}
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedCategoryId === undefined && [
                    styles.optionItemSelected,
                    { backgroundColor: theme.colors.primary + "15" },
                  ],
                ]}
                onPress={() => handleCategorySelect(undefined)}
              >
                <MaterialIcons
                  name="folder-open"
                  size={20}
                  color={
                    selectedCategoryId === undefined
                      ? theme.colors.primary
                      : theme.colors.foregroundSecondary
                  }
                />
                <Text
                  style={[
                    styles.optionText,
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
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>

              {/* 无分类选项 */}
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedCategoryId === "__uncategorized__" && [
                    styles.optionItemSelected,
                    { backgroundColor: theme.colors.primary + "15" },
                  ],
                ]}
                onPress={() => handleCategorySelect("__uncategorized__")}
              >
                <MaterialIcons
                  name="folder"
                  size={20}
                  color={
                    selectedCategoryId === "__uncategorized__"
                      ? theme.colors.primary
                      : theme.colors.foregroundSecondary
                  }
                />
                <Text
                  style={[
                    styles.optionText,
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
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>

              {/* 分隔线 */}
              {categories.length > 0 && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}

              {/* 用户自定义分类列表 */}
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.categoryId}
                  style={[
                    styles.optionItem,
                    selectedCategoryId === category.categoryId && [
                      styles.optionItemSelected,
                      { backgroundColor: theme.colors.primary + "15" },
                    ],
                  ]}
                  onPress={() => handleCategorySelect(category.categoryId)}
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
                      styles.optionText,
                      {
                        color:
                          selectedCategoryId === category.categoryId
                            ? theme.colors.primary
                            : theme.colors.foreground,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                  {selectedCategoryId === category.categoryId && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {/* 新建分类按钮 */}
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  styles.addCategoryButton,
                ]}
                onPress={() => setCreateModalVisible(true)}
              >
                <MaterialIcons
                  name="add"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: theme.colors.primary },
                  ]}
                >
                  新建分类
                </Text>
              </TouchableOpacity>
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

              {/* 排序字段 */}
              <View style={styles.sortGroup}>
                <Text
                  style={[
                    styles.sortGroupLabel,
                    { color: theme.colors.foregroundQuaternary },
                  ]}
                >
                  排序字段
                </Text>
                <View style={styles.sortOptions}>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      sortField === "createdAt" && [
                        styles.sortOptionSelected,
                        {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        },
                      ],
                      sortField !== "createdAt" && {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.card,
                      },
                    ]}
                    onPress={() => handleSortFieldChange("createdAt")}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        {
                          color:
                            sortField === "createdAt"
                              ? theme.colors.primaryForeground
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      创建时间
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      sortField === "updatedAt" && [
                        styles.sortOptionSelected,
                        {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        },
                      ],
                      sortField !== "updatedAt" && {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.card,
                      },
                    ]}
                    onPress={() => handleSortFieldChange("updatedAt")}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        {
                          color:
                            sortField === "updatedAt"
                              ? theme.colors.primaryForeground
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      编辑时间
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 排序方向 */}
              <View style={styles.sortGroup}>
                <Text
                  style={[
                    styles.sortGroupLabel,
                    { color: theme.colors.foregroundQuaternary },
                  ]}
                >
                  排序方向
                </Text>
                <View style={styles.sortOptions}>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      sortOrder === "desc" && [
                        styles.sortOptionSelected,
                        {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        },
                      ],
                      sortOrder !== "desc" && {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.card,
                      },
                    ]}
                    onPress={() => handleSortOrderChange("desc")}
                  >
                    <MaterialIcons
                      name="arrow-downward"
                      size={16}
                      color={
                        sortOrder === "desc"
                          ? theme.colors.primaryForeground
                          : theme.colors.foreground
                      }
                      style={styles.sortOptionIcon}
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        {
                          color:
                            sortOrder === "desc"
                              ? theme.colors.primaryForeground
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      从新到旧
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      sortOrder === "asc" && [
                        styles.sortOptionSelected,
                        {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        },
                      ],
                      sortOrder !== "asc" && {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.card,
                      },
                    ]}
                    onPress={() => handleSortOrderChange("asc")}
                  >
                    <MaterialIcons
                      name="arrow-upward"
                      size={16}
                      color={
                        sortOrder === "asc"
                          ? theme.colors.primaryForeground
                          : theme.colors.foreground
                      }
                      style={styles.sortOptionIcon}
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        {
                          color:
                            sortOrder === "asc"
                              ? theme.colors.primaryForeground
                              : theme.colors.foreground,
                        },
                      ]}
                    >
                      从旧到新
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
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
  sortGroup: {
    marginBottom: 16,
  },
  sortGroupLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: "row",
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
});
