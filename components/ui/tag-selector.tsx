/**
 * TagSelector Component - 标签选择器
 *
 * 提供标签选择功能：
 * - 显示已有标签列表供选择（多选）
 * - 支持输入新标签名称并创建
 * - 已选择标签显示选中状态
 * - 支持移除已选标签
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { useService } from "@rabjs/react";
import type { TagDto } from "@/types/tag";
import TagService from "@/services/tag-service";

export interface TagSelectorProps {
  /** 已选中的标签列表 */
  selectedTags: TagDto[];
  /** 标签变化回调 */
  onChange: (tags: TagDto[]) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否自动获取标签列表 */
  autoFetch?: boolean;
}

export function TagSelector({
  selectedTags,
  onChange,
  disabled = false,
  autoFetch = true,
}: TagSelectorProps) {
  const theme = useTheme();
  const tagService = useService(TagService);

  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // 自动获取标签列表
  useEffect(() => {
    if (autoFetch && tagService.tags.length === 0 && !tagService.loading) {
      tagService.fetchTags().catch(console.error);
    }
  }, [autoFetch, tagService]);

  // 切换标签选中状态
  const handleTagPress = (tag: TagDto) => {
    if (disabled) return;

    const isSelected = selectedTags.some((t) => t.tagId === tag.tagId);
    if (isSelected) {
      // 移除标签
      onChange(selectedTags.filter((t) => t.tagId !== tag.tagId));
    } else {
      // 添加标签
      onChange([...selectedTags, tag]);
    }
  };

  // 移除已选标签
  const handleRemoveTag = (tag: TagDto) => {
    if (disabled) return;
    onChange(selectedTags.filter((t) => t.tagId !== tag.tagId));
  };

  // 创建新标签
  const handleCreateTag = async () => {
    const name = inputValue.trim();
    if (!name || disabled) return;

    setIsCreating(true);
    try {
      const newTag = await tagService.createTag(name);
      // 添加新创建的标签到已选列表
      onChange([...selectedTags, newTag]);
      setInputValue("");
    } catch (error) {
      console.error("创建标签失败:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // 检查标签是否被选中
  const isTagSelected = (tag: TagDto) => {
    return selectedTags.some((t) => t.tagId === tag.tagId);
  };

  // 排序标签：已选中的在前，其余按名称排序
  const sortedTags = [...tagService.tags].sort((a, b) => {
    const aSelected = isTagSelected(a);
    const bSelected = isTagSelected(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <View style={styles.container}>
      {/* 已选标签展示 */}
      {selectedTags.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            已选择
          </Text>
          <View style={styles.selectedTags}>
            {selectedTags.map((tag) => (
              <TouchableOpacity
                key={tag.tagId}
                style={[
                  styles.tag,
                  styles.selectedTag,
                  {
                    backgroundColor: theme.colors.primary + "20",
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => handleRemoveTag(tag)}
                disabled={disabled}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {tag.name}
                </Text>
                <MaterialIcons
                  name="close"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 可选标签列表 */}
      <View style={styles.availableContainer}>
        <Text
          style={[
            styles.sectionLabel,
            { color: theme.colors.foregroundSecondary },
          ]}
        >
          选择标签
        </Text>

        {tagService.loading && tagService.tags.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text
              style={[
                styles.loadingText,
                { color: theme.colors.foregroundTertiary },
              ]}
            >
              加载中...
            </Text>
          </View>
        ) : sortedTags.length === 0 ? (
          <Text
            style={[
              styles.emptyText,
              { color: theme.colors.foregroundTertiary },
            ]}
          >
            暂无标签，请创建新标签
          </Text>
        ) : (
          <View style={styles.tagList}>
            {sortedTags.map((tag) => {
              const selected = isTagSelected(tag);
              return (
                <TouchableOpacity
                  key={tag.tagId}
                  style={[
                    styles.tag,
                    selected && [
                      styles.selectedTag,
                      {
                        backgroundColor: theme.colors.primary + "20",
                        borderColor: theme.colors.primary,
                      },
                    ],
                    !selected && {
                      backgroundColor: theme.colors.muted,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleTagPress(tag)}
                  disabled={disabled}
                >
                  <MaterialIcons
                    name={selected ? "check-circle" : "radio-button-unchecked"}
                    size={18}
                    color={
                      selected
                        ? theme.colors.primary
                        : theme.colors.foregroundTertiary
                    }
                  />
                  <Text
                    style={[
                      styles.tagText,
                      { color: selected ? theme.colors.primary : theme.colors.foreground },
                    ]}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 新建标签输入框 */}
      <View style={styles.createContainer}>
        <Text
          style={[
            styles.sectionLabel,
            { color: theme.colors.foregroundSecondary },
          ]}
        >
          创建新标签
        </Text>
        <View style={styles.createRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input,
                color: theme.colors.inputForeground,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="输入标签名称"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleCreateTag}
            editable={!disabled}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: theme.colors.primary,
              },
              (!inputValue.trim() || disabled || isCreating) &&
                styles.createButtonDisabled,
            ]}
            onPress={handleCreateTag}
            disabled={!inputValue.trim() || disabled || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
            ) : (
              <MaterialIcons
                name="add"
                size={20}
                color={theme.colors.primaryForeground}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  selectedContainer: {
    gap: 8,
  },
  availableContainer: {
    gap: 8,
  },
  createContainer: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  selectedTag: {
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
  createRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
});
