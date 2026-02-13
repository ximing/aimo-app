/**
 * Create Memo Page - 新建备忘录页面
 * 提供编辑标题、内容、上传媒体等功能
 */

import { uploadAttachment } from "@/api/attachment";
import { createMemo } from "@/api/memo";
import { MediaPicker } from "@/components/memos/media-picker";
import { MediaPreview } from "@/components/memos/media-preview";
import { useMediaPicker } from "@/hooks/use-media-picker";
import { useTheme } from "@/hooks/use-theme";
import MemoService from "@/services/memo-service";
import { MaterialIcons } from "@expo/vector-icons";
import { useService, view } from "@rabjs/react";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CreateMemoContent = view(() => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const memoService = useService(MemoService);
  const {
    selectedMedia,
    loading: mediaLoading,
    error: mediaError,
    takePicture,
    pickImage,
    pickVideo,
    removeMedia,
    clearMedia,
    clearError: clearMediaError,
  } = useMediaPicker();

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理返回
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // 处理提交
  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      setError("请输入内容");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 上传媒体文件
      const attachmentIds: string[] = [];
      for (const media of selectedMedia) {
        const attachment = await uploadAttachment({
          file: { uri: media.uri, type: media.mimeType },
          fileName: media.name,
          createdAt: Date.now(),
        });
        attachmentIds.push(attachment.id);
      }

      // 构建 memo 内容
      const memoContent = content.trim();

      // 创建 Memo - 严格按照 CreateMemoRequest 接口
      const memo = await createMemo({
        content: memoContent,
        attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
      });

      console.log("Memo created:", memo);

      // 刷新列表
      await memoService.refreshMemos();

      // 返回列表
      router.back();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "创建失败";
      setError(errorMsg);
      console.error("Failed to create memo:", err);
    } finally {
      setSubmitting(false);
    }
  }, [content, selectedMedia, router, memoService]);

  // 处理清空
  const handleClear = useCallback(() => {
    setContent("");
    clearMedia();
    setError(null);
  }, [clearMedia]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* 头部 */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
            paddingTop: Math.max(insets.top, theme.spacing.md),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          disabled={submitting}
        >
          <MaterialIcons
            name="close"
            size={24}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.foreground }]}>
          新建备忘录
        </Text>

        <TouchableOpacity
          style={[styles.headerButton, { opacity: submitting ? 0.5 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <MaterialIcons
              name="check"
              size={24}
              color={theme.colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* 内容输入 */}
        <View
          style={[
            styles.inputSection,
            styles.contentSection,
            {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.contentInput,
              {
                color: content
                  ? theme.colors.foreground
                  : theme.colors.foregroundTertiary,
              },
            ]}
            placeholder="输入内容..."
            placeholderTextColor={theme.colors.foregroundTertiary}
            onChangeText={setContent}
            value={content}
            multiline
            numberOfLines={10}
          />
        </View>

        {/* 媒体预览 */}
        {selectedMedia.length > 0 && (
          <MediaPreview media={selectedMedia} onRemove={removeMedia} />
        )}

        {/* 错误信息 */}
        {(error || mediaError) && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: theme.colors.destructive },
            ]}
          >
            <MaterialIcons name="error" size={18} color="#fff" />
            <Text style={styles.errorText}>{error || mediaError}</Text>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                clearMediaError();
              }}
            >
              <MaterialIcons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 媒体选择器 */}
      <MediaPicker
        onTakePicture={takePicture}
        onPickImage={pickImage}
        onPickVideo={pickVideo}
        loading={mediaLoading}
        error={mediaError}
      />

      {/* 底部操作栏 */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            paddingBottom: Math.max(insets.bottom, theme.spacing.md),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.footerButton, { opacity: submitting ? 0.5 : 1 }]}
          onPress={handleClear}
          disabled={submitting}
        >
          <MaterialIcons
            name="clear-all"
            size={20}
            color={theme.colors.foregroundSecondary}
          />
          <Text
            style={[
              styles.footerButtonText,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            清空
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
});

export default CreateMemoContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 头部
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  // 内容区域
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  // 输入框
  inputSection: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  placeholder: {
    fontSize: 12,
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "600",
    padding: 0,
    minHeight: 40,
  },
  contentSection: {
    minHeight: 150,
  },
  contentInput: {
    fontSize: 15,
    lineHeight: 22,
    padding: 0,
    textAlignVertical: "top",
  },
  // 错误提示
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#fff",
  },
  // 底部
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  footerButtonText: {
    fontSize: 13,
  },
});
