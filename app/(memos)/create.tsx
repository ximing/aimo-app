/**
 * Create Memo Page - 新建备忘录页面
 * 提供编辑标题、内容、上传媒体等功能
 */

import { uploadAttachment } from "@/api/attachment";
import { createMemo, updateMemo } from "@/api/memo";
import { MediaPreview } from "@/components/memos/media-preview";
import { useMediaPicker } from "@/hooks/use-media-picker";
import { useTheme } from "@/hooks/use-theme";
import MemoService from "@/services/memo-service";
import { showError, showSuccess } from "@/utils/toast";
import { MaterialIcons } from "@expo/vector-icons";
import { useService, view } from "@rabjs/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CreateMemoContent = view(() => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const memoService = useService(MemoService);
  const { memoId: queryMemoId } = useLocalSearchParams<{ memoId: string }>();
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
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 初始化加载编辑数据
  useEffect(() => {
    const initEditData = async () => {
      if (queryMemoId) {
        setIsLoading(true);
        try {
          // 从 Service 获取已缓存的数据或直接调用 API
          const memo = memoService.currentMemo;
          if (memo && memo.memoId === queryMemoId) {
            // 使用已缓存的数据
            setContent(memo.content);
            setIsEditMode(true);
          } else {
            // 需要重新加载数据
            await memoService.fetchMemoDetail(queryMemoId);
            const freshMemo = memoService.currentMemo;
            if (freshMemo) {
              setContent(freshMemo.content);
              setIsEditMode(true);
            }
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "加载数据失败";
          setError(errorMsg);
          console.error("Failed to load memo:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initEditData();
  }, [queryMemoId, memoService]);

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

      if (isEditMode && queryMemoId) {
        // 编辑模式
        const memo = await updateMemo(queryMemoId, {
          content: memoContent,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
        });

        console.log("Memo updated:", memo);
        showSuccess("编辑成功");

        // 刷新列表和详情
        await memoService.refreshMemos();
        await memoService.fetchMemoDetail(queryMemoId);
      } else {
        // 创建模式
        const memo = await createMemo({
          content: memoContent,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
        });

        console.log("Memo created:", memo);
        showSuccess("创建成功");

        // 刷新列表
        await memoService.refreshMemos();
      }

      // 返回
      router.back();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : isEditMode
            ? "编辑失败"
            : "创建失败";
      setError(errorMsg);
      showError(errorMsg);
      console.error(
        isEditMode ? "Failed to update memo:" : "Failed to create memo:",
        err,
      );
    } finally {
      setSubmitting(false);
    }
  }, [content, selectedMedia, router, memoService, isEditMode, queryMemoId]);

  // 处理清空
  const handleClear = useCallback(() => {
    setContent("");
    clearMedia();
    setError(null);
  }, [clearMedia]);

  if (isLoading && isEditMode) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.info} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      {/* 头部 */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.headerIconButton,
            { backgroundColor: theme.colors.muted },
          ]}
          onPress={handleGoBack}
          disabled={submitting}
        >
          <MaterialIcons
            name="close"
            size={20}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            styles.headerIconButton,
            {
              backgroundColor: theme.colors.muted,
              opacity: submitting ? 0.5 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <MaterialIcons
              name="check"
              size={20}
              color={theme.colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* 内容输入区域 - 铺满中间区域 */}
      <View
        style={[
          styles.inputSection,
          {
            flex: 1,
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.contentInput,
            {
              flex: 1,
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
          scrollEnabled
        />
      </View>

      {/* 媒体预览 */}
      {selectedMedia.length > 0 && (
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
          }}
        >
          <MediaPreview media={selectedMedia} onRemove={removeMedia} />
        </View>
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

      {/* 底部操作栏 - 贴着键盘显示 */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
          },
        ]}
      >
        {/* 清空按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: submitting ? 0.5 : 1 }]}
          onPress={handleClear}
          disabled={submitting}
        >
          <MaterialIcons
            name="delete"
            size={20}
            color={theme.colors.foregroundSecondary}
          />
        </TouchableOpacity>

        {/* 分隔符 */}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        {/* 拍照按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: mediaLoading ? 0.5 : 1 }]}
          onPress={takePicture}
          disabled={mediaLoading}
        >
          {mediaLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.foregroundSecondary}
            />
          ) : (
            <MaterialIcons
              name="camera-alt"
              size={20}
              color={theme.colors.foregroundSecondary}
            />
          )}
        </TouchableOpacity>

        {/* 图片按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: mediaLoading ? 0.5 : 1 }]}
          onPress={pickImage}
          disabled={mediaLoading}
        >
          <MaterialIcons
            name="image"
            size={20}
            color={theme.colors.foregroundSecondary}
          />
        </TouchableOpacity>

        {/* 视频按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: mediaLoading ? 0.5 : 1 }]}
          onPress={pickVideo}
          disabled={mediaLoading}
        >
          <MaterialIcons
            name="videocam"
            size={20}
            color={theme.colors.foregroundSecondary}
          />
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
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 56,
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  // 输入框
  inputSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentInput: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlignVertical: "top",
  },
  // 错误提示
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
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
  // 底部操作栏
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
  },
});
