/**
 * CategoryPickerModal Component - 分类选择弹窗
 *
 * 功能：
 * - 显示所有分类列表（包含"无分类"选项）
 * - 支持选择分类
 * - 支持创建新分类
 * - 回调返回选中的 categoryId
 */

import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CreateCategoryModal } from "./create-category-modal";
import { useTheme } from "@/hooks/use-theme";
import type { Category } from "@/types/category";

interface CategoryPickerModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 分类列表 */
  categories: Category[];
  /** 当前选中的分类 ID（null 表示无分类） */
  selectedCategoryId: string | null;
  /** 选择分类时的回调 */
  onSelect: (categoryId: string | null) => void;
  /** 关闭弹窗的回调 */
  onClose: () => void;
}

export const CategoryPickerModal = view(
  ({
    visible,
    categories,
    selectedCategoryId,
    onSelect,
    onClose,
  }: CategoryPickerModalProps) => {
    const theme = useTheme();
    const [createModalVisible, setCreateModalVisible] = useState(false);

    // 处理分类选择
    const handleSelectCategory = (categoryId: string | null) => {
      onSelect(categoryId);
      onClose();
    };

    // 处理创建新分类
    const handleCreateSuccess = (categoryId: string) => {
      onSelect(categoryId);
      setCreateModalVisible(false);
      onClose();
    };

    return (
      <>
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={onClose}
        >
          <Pressable style={styles.overlay} onPress={onClose}>
            <Pressable
              style={[
                styles.container,
                {
                  backgroundColor: theme.colors.card,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* 标题 */}
              <View style={styles.header}>
                <Text
                  style={[styles.title, { color: theme.colors.foreground }]}
                >
                  选择分类
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={theme.colors.foregroundSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* 分类列表 */}
              <ScrollView
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* 无分类选项 */}
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedCategoryId === null && [
                      styles.optionItemSelected,
                      { backgroundColor: theme.colors.primary + "15" },
                    ],
                  ]}
                  onPress={() => handleSelectCategory(null)}
                >
                  <MaterialIcons
                    name="folder"
                    size={20}
                    color={
                      selectedCategoryId === null
                        ? theme.colors.primary
                        : theme.colors.foregroundSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          selectedCategoryId === null
                            ? theme.colors.primary
                            : theme.colors.foreground,
                      },
                    ]}
                  >
                    无分类
                  </Text>
                  {selectedCategoryId === null && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>

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

              {/* 创建新分类按钮 */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  { borderTopColor: theme.colors.border },
                ]}
                onPress={() => setCreateModalVisible(true)}
              >
                <MaterialIcons
                  name="add"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.createButtonText, { color: theme.colors.primary }]}
                >
                  创建新分类
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* 创建分类弹窗 */}
        <CreateCategoryModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onSuccess={handleCreateSuccess}
        />
      </>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    maxHeight: "70%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeBtn: {
    padding: 4,
  },
  listContainer: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionItemSelected: {
    borderRadius: 0,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  checkIcon: {
    marginLeft: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 4,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

export default CategoryPickerModal;
