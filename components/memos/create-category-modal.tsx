/**
 * CreateCategoryModal Component - 创建分类弹窗
 * 用于在筛选抽屉中创建新分类
 *
 * 功能：
 * - 输入分类名称
 * - 选择分类颜色
 * - 确认/取消创建
 */

import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 预设颜色列表
const PRESET_COLORS = [
  "#22c55e", // 绿色（默认）
  "#3b82f6", // 蓝色
  "#f59e0b", // 橙色
  "#ef4444", // 红色
  "#8b5cf6", // 紫色
  "#ec4899", // 粉色
  "#14b8a6", // 青色
  "#6366f1", // 靛蓝
];

interface CreateCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (categoryId: string) => void;
}

export const CreateCategoryModal = view(
  ({ visible, onClose, onSuccess }: CreateCategoryModalProps) => {
    const theme = useTheme();
    const [name, setName] = useState("");
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [loading, setLoading] = useState(false);

    // 处理确认创建
    const handleCreate = async () => {
      if (!name.trim()) return;

      setLoading(true);
      try {
        // 调用 CategoryService 创建分类
        const { default: CategoryService } = await import(
          "@/services/category-service"
        );
        const { resolve } = await import("@rabjs/react");
        const categoryService = resolve(CategoryService);

        const newCategory = await categoryService.createCategory({
          name: name.trim(),
          color: selectedColor,
        });

        // 清空输入并关闭
        setName("");
        setSelectedColor(PRESET_COLORS[0]);
        onSuccess?.(newCategory.categoryId);
        onClose();
      } catch (error) {
        console.error("创建分类失败:", error);
      } finally {
        setLoading(false);
      }
    };

    // 处理取消
    const handleCancel = () => {
      setName("");
      setSelectedColor(PRESET_COLORS[0]);
      onClose();
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.overlay} onPress={handleCancel}>
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
                新建分类
              </Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.foregroundSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* 分类名称输入 */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.label,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                分类名称
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.input,
                    color: theme.colors.inputForeground,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="请输入分类名称"
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={name}
                onChangeText={setName}
                maxLength={20}
                autoFocus
              />
            </View>

            {/* 颜色选择 */}
            <View style={styles.colorContainer}>
              <Text
                style={[
                  styles.label,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                分类颜色
              </Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                      selectedColor === color && {
                        borderColor: theme.colors.foreground,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color="#ffffff"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 预览 */}
            <View style={styles.previewContainer}>
              <Text
                style={[
                  styles.label,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                预览
              </Text>
              <View style={styles.preview}>
                <View
                  style={[
                    styles.previewDot,
                    { backgroundColor: selectedColor },
                  ]}
                />
                <Text
                  style={[styles.previewText, { color: theme.colors.foreground }]}
                  numberOfLines={1}
                >
                  {name || "分类名称"}
                </Text>
              </View>
            </View>

            {/* 按钮 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: theme.colors.muted },
                ]}
                onPress={handleCancel}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.colors.foreground },
                  ]}
                >
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  {
                    backgroundColor: name.trim()
                      ? theme.colors.primary
                      : theme.colors.muted,
                  },
                ]}
                onPress={handleCreate}
                disabled={!name.trim() || loading}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: name.trim()
                        ? theme.colors.primaryForeground
                        : theme.colors.mutedForeground,
                    },
                  ]}
                >
                  {loading ? "创建中..." : "创建"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
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
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeBtn: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  colorContainer: {
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 2,
  },
  previewContainer: {
    marginBottom: 20,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  previewText: {
    fontSize: 15,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
