/**
 * TagSelector Component - 轻量级标签选择器
 *
 * 设计原则：
 * - 默认只显示已选标签 + 添加按钮
 * - 点击添加后显示输入框，输入时智能匹配已有标签
 * - 可直接创建新标签
 * - 大部分笔记可以不需要标签，保持界面简洁
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Keyboard,
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
  const inputRef = useRef<TextInput>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [matchedTags, setMatchedTags] = useState<TagDto[]>([]);

  // 自动获取标签列表
  useEffect(() => {
    if (autoFetch && tagService.tags.length === 0 && !tagService.loading) {
      tagService.fetchTags().catch(console.error);
    }
  }, [autoFetch, tagService]);

  // 输入时智能匹配已有标签
  useEffect(() => {
    if (!inputValue.trim()) {
      setMatchedTags([]);
      return;
    }

    const query = inputValue.toLowerCase().trim();
    const matched = tagService.tags
      .filter(
        (tag) =>
          tag.name.toLowerCase().includes(query) &&
          !selectedTags.some((t) => t.tagId === tag.tagId)
      )
      .slice(0, 5); // 最多显示 5 个匹配

    setMatchedTags(matched);
  }, [inputValue, tagService.tags, selectedTags]);

  // 开始编辑
  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // 结束编辑
  const handleEndEdit = () => {
    setIsEditing(false);
    setInputValue("");
    setMatchedTags([]);
    Keyboard.dismiss();
  };

  // 移除已选标签
  const handleRemoveTag = (tag: TagDto) => {
    if (disabled) return;
    onChange(selectedTags.filter((t) => t.tagId !== tag.tagId));
  };

  // 选择已有标签
  const handleSelectTag = (tag: TagDto) => {
    if (disabled) return;
    onChange([...selectedTags, tag]);
    setInputValue("");
    setMatchedTags([]);
    inputRef.current?.focus();
  };

  // 创建新标签
  const handleCreateTag = async () => {
    const name = inputValue.trim();
    if (!name || disabled) return;

    // 检查是否已存在同名标签
    const existingTag = tagService.tags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existingTag) {
      // 如果已存在且未选中，则选中它
      if (!selectedTags.some((t) => t.tagId === existingTag.tagId)) {
        onChange([...selectedTags, existingTag]);
      }
      setInputValue("");
      setMatchedTags([]);
      handleEndEdit();
      return;
    }

    setIsCreating(true);
    try {
      const newTag = await tagService.createTag(name);
      onChange([...selectedTags, newTag]);
      setInputValue("");
      setMatchedTags([]);
      // 保持编辑状态，可以继续添加
    } catch (error) {
      console.error("创建标签失败:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // 提交输入
  const handleSubmit = () => {
    if (!inputValue.trim()) {
      handleEndEdit();
      return;
    }

    // 如果有匹配的标签，直接选择第一个
    if (matchedTags.length > 0) {
      handleSelectTag(matchedTags[0]);
      return;
    }

    // 否则创建新标签
    handleCreateTag();
  };

  // 渲染已选标签
  const renderSelectedTags = () => {
    if (selectedTags.length === 0 && !isEditing) return null;

    return (
      <View style={styles.selectedContainer}>
        {selectedTags.map((tag) => (
          <TouchableOpacity
            key={tag.tagId}
            style={[
              styles.tagChip,
              {
                backgroundColor: theme.colors.primary + "15",
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => handleRemoveTag(tag)}
            disabled={disabled}
          >
            <Text
              style={[styles.tagChipText, { color: theme.colors.primary }]}
            >
              {tag.name}
            </Text>
            <MaterialIcons
              name="close"
              size={14}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 渲染输入区域
  const renderInputArea = () => {
    if (!isEditing) return null;

    return (
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.input,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { color: theme.colors.inputForeground },
            ]}
            placeholder="输入标签名..."
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmit}
            onBlur={handleEndEdit}
            editable={!disabled && !isCreating}
            returnKeyType="done"
            autoCapitalize="none"
          />
          {isCreating && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.loadingIndicator}
            />
          )}
        </View>

        {/* 匹配建议 */}
        {matchedTags.length > 0 && (
          <View
            style={[
              styles.suggestionsContainer,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {matchedTags.map((tag) => (
              <TouchableOpacity
                key={tag.tagId}
                style={[
                  styles.suggestionItem,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={() => handleSelectTag(tag)}
              >
                <MaterialIcons
                  name="add"
                  size={18}
                  color={theme.colors.foregroundSecondary}
                />
                <Text
                  style={[
                    styles.suggestionText,
                    { color: theme.colors.foreground },
                  ]}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 输入时显示创建选项 */}
        {inputValue.trim() && matchedTags.length === 0 && !isCreating && (
          <TouchableOpacity
            style={[
              styles.createHint,
              { backgroundColor: theme.colors.muted },
            ]}
            onPress={handleCreateTag}
          >
            <MaterialIcons
              name="add"
              size={16}
              color={theme.colors.foregroundSecondary}
            />
            <Text
              style={[
                styles.createHintText,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              创建 「{inputValue.trim()}」
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 已选标签展示 + 添加按钮 */}
      <View style={styles.header}>
        {renderSelectedTags()}

        {/* 添加标签按钮 - 只在非编辑状态且未选择任何标签时显示，或者始终显示在右侧 */}
        {!isEditing && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { borderColor: theme.colors.border },
            ]}
            onPress={handleStartEdit}
            disabled={disabled}
          >
            <MaterialIcons
              name="add"
              size={16}
              color={theme.colors.foregroundSecondary}
            />
            <Text
              style={[
                styles.addButtonText,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              添加标签
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 输入区域 */}
      {renderInputArea()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
  },
  inputContainer: {
    gap: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 36,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    fontSize: 14,
  },
  createHint: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  createHintText: {
    fontSize: 13,
  },
});
