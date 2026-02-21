/**
 * Category Filter Dropdown Component - 分类筛选下拉组件
 *
 * 功能：
 * - 点击展开分类选择下拉
 * - 选项：全部分类、无分类、用户自定义分类列表
 * - 分类支持单选，选中后立即应用筛选
 * - 选中的筛选条件在按钮上显示标签
 */

import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

import { useTheme } from "@/hooks/use-theme";
import type { Category } from "@/types/category";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CategoryFilterDropdownProps {
  /** 分类列表 */
  categories: Category[];
  /** 当前选中的分类 ID（undefined 表示全部分类，'__uncategorized__' 表示无分类） */
  selectedCategoryId: string | undefined;
  /** 选择分类时的回调 */
  onSelectCategory: (categoryId: string | undefined) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

export const CategoryFilterDropdown = view(
  ({
    categories,
    selectedCategoryId,
    onSelectCategory,
    disabled = false,
  }: CategoryFilterDropdownProps) => {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);

    // 动画值
    const scaleY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // 触发动画
    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, scaleY, opacity]);

    // 打开下拉
    const handleOpen = useCallback(() => {
      if (!disabled) {
        setVisible(true);
      }
    }, [disabled]);

    // 关闭下拉
    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    // 处理分类选择
    const handleSelectCategory = useCallback(
      (categoryId: string | undefined) => {
        onSelectCategory(categoryId);
        handleClose();
      },
      [onSelectCategory, handleClose]
    );

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

    // 获取按钮显示文本
    const getButtonText = (): string => {
      return getCategoryDisplayName(selectedCategoryId);
    };

    // 是否已选择非默认选项
    const isActive = selectedCategoryId !== undefined;

    return (
      <>
        {/* 触发按钮 */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            isActive && { borderColor: theme.colors.primary },
            disabled && styles.filterButtonDisabled,
          ]}
          onPress={handleOpen}
          activeOpacity={disabled ? 1 : 0.7}
          disabled={disabled}
        >
          <MaterialIcons
            name="folder"
            size={16}
            color={isActive ? theme.colors.primary : theme.colors.foregroundSecondary}
          />
          <Text
            style={[
              styles.filterButtonText,
              { color: isActive ? theme.colors.primary : theme.colors.foregroundSecondary },
            ]}
            numberOfLines={1}
          >
            {getButtonText()}
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={16}
            color={isActive ? theme.colors.primary : theme.colors.foregroundTertiary}
          />
        </TouchableOpacity>

        {/* 下拉菜单 Modal */}
        <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={handleClose}
        >
          <View style={styles.modalContainer}>
            {/* 背景遮罩 */}
            <Pressable style={styles.backdrop} onPress={handleClose}>
              <Animated.View
                style={[
                  styles.backdropAnimated,
                  { opacity, backgroundColor: theme.colors.overlay },
                ]}
              />
            </Pressable>

            {/* 下拉内容 */}
            <Animated.View
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.colors.card,
                  transform: [{ scaleY }],
                  opacity,
                },
              ]}
            >
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* 全部分类选项 */}
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedCategoryId === undefined && [
                      styles.optionItemSelected,
                      { backgroundColor: theme.colors.primary + "15" },
                    ],
                  ]}
                  onPress={() => handleSelectCategory(undefined)}
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
                  onPress={() => handleSelectCategory("__uncategorized__")}
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
                    onPress={() => handleSelectCategory(category.categoryId)}
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
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </>
    );
  }
);

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    gap: 4,
    maxWidth: 120,
  },
  filterButtonDisabled: {
    opacity: 0.5,
  },
  filterButtonText: {
    fontSize: 13,
    marginHorizontal: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 140,
    paddingLeft: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropAnimated: {
    flex: 1,
  },
  dropdownContainer: {
    position: "absolute",
    left: 100,
    top: 130,
    minWidth: 180,
    maxWidth: SCREEN_WIDTH - 120,
    maxHeight: 320,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  scrollView: {
    maxHeight: 320,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionItemSelected: {
    borderRadius: 0,
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
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default CategoryFilterDropdown;
