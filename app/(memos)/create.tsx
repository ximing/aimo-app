/**
 * Create Memo Page - 新建备忘录页面
 * 提供编辑标题、内容、上传媒体等功能
 */

import { uploadAttachment } from "@/api/attachment";
import { createMemo } from "@/api/memo";
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
          style={[
            styles.divider,
            { backgroundColor: theme.colors.border },
          ]}
        />

        {/* 拍照按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: mediaLoading ? 0.5 : 1 }]}
          onPress={takePicture}
          disabled={mediaLoading}
        >
          {mediaLoading ? (
            <ActivityIndicator size="small" color={theme.colors.foregroundSecondary} />
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
