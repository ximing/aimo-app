/**
 * Create Memo Page - 新建备忘录页面
 * 提供编辑标题、内容、上传媒体等功能
 */

import { uploadAttachment } from "@/api/attachment";
import { parseImage } from "@/api/ocr";
import { CategoryPickerModal } from "@/components/memos/category-picker-modal";
import { MediaPreview } from "@/components/memos/media-preview";
import {
  OcrSourcePicker,
  OcrSourceType,
  handleOcrSourceSelect as processOcrSource,
} from "@/components/memos/ocr-source-picker";
import { VoiceRecorderModal } from "@/components/memos/voice-recorder-modal";
import { TagSelector } from "@/components/ui/tag-selector";
import { useMediaPicker, type SelectedMedia } from "@/hooks/use-media-picker";
import { useTheme } from "@/hooks/use-theme";
import CreateMemoService from "@/services/create-memo-service";
import CategoryService from "@/services/category-service";
import OcrService from "@/services/ocr-service";
import VoiceMemoService from "@/services/voice-memo-service";
import { showError, showSuccess } from "@/utils/toast";
import { getFileTypeFromMime } from "@/utils/attachment";
import { MaterialIcons } from "@expo/vector-icons";
import { bindServices, useService, view } from "@rabjs/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Camera,
  Check,
  FileText,
  Image,
  Mic,
  ScanText,
  Video,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  const createMemoService = useService(CreateMemoService);
  const categoryService = useService(CategoryService);
  const voiceMemoService = useService(VoiceMemoService);
  const ocrService = useService(OcrService);
  const {
    memoId: queryMemoId,
    imageUri: queryImageUri,
    imageType: queryImageType,
    audioUri: queryAudioUri,
    ocr: queryOcr,
    ocrContent: queryOcrContent,
    ocrImageUri: queryOcrImageUri,
  } = useLocalSearchParams<{
    memoId?: string;
    imageUri?: string;
    imageType?: string;
    audioUri?: string;
    ocr?: string;
    ocrContent?: string;
    ocrImageUri?: string;
  }>();
  const {
    selectedMedia,
    loading: mediaLoading,
    error: mediaError,
    takePicture,
    pickImage,
    pickVideo,
    pickPdf,
    removeMedia,
    clearMedia,
    clearError: clearMediaError,
    addMedia,
    setMedia,
  } = useMediaPicker();

  const [voiceRecorderVisible, setVoiceRecorderVisible] = useState(false);
  const [ocrPickerVisible, setOcrPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  // 初始化加载编辑数据 + 新建时清空状态
  useEffect(() => {
    const initEditData = async () => {
      if (!queryMemoId) {
        clearMedia();
        voiceMemoService.resetAll();
        ocrService.resetOcr();
      }

      try {
        await createMemoService.initEditData(queryMemoId);
      } catch (err) {
        console.error("Failed to load memo:", err);
      }
    };

    initEditData();
  }, [
    queryMemoId,
    clearMedia,
    createMemoService,
    voiceMemoService,
    ocrService,
  ]);

  // 编辑模式下，加载已有附件到媒体预览
  useEffect(() => {
    if (!createMemoService.isEditMode || !createMemoService.currentMemo) {
      return;
    }

    const attachments = createMemoService.currentMemo.attachments;
    if (!attachments || attachments.length === 0) {
      return;
    }

    // 把 AttachmentDto 转换成 SelectedMedia
    const existingMedia: SelectedMedia[] = attachments
      .map((att): SelectedMedia | null => {
        const fileType = getFileTypeFromMime(att.type);
        // 只处理支持的媒体类型
        if (!["image", "video", "audio", "pdf"].includes(fileType)) {
          return null;
        }
        return {
          type: fileType as "image" | "video" | "audio" | "pdf",
          uri: att.url,
          name: att.filename,
          mimeType: att.type,
          size: att.size,
          attachmentId: att.attachmentId,
        };
      })
      .filter((media): media is SelectedMedia => media !== null);

    if (existingMedia.length > 0) {
      setMedia(existingMedia);
    }
  }, [createMemoService.isEditMode, createMemoService.currentMemo, setMedia]);

  // 处理从外部传入的图片（拍照或相册选择后）
  useEffect(() => {
    const initMediaFromQuery = async () => {
      if (queryImageUri && queryImageType === "image") {
        try {
          // 解码图片 URI
          const decodedUri = decodeURIComponent(queryImageUri);
          const media = {
            type: "image" as const,
            uri: decodedUri,
            name: `photo-${Date.now()}.jpg`,
            mimeType: "image/jpeg",
          };
          // 添加到 selectedMedia
          addMedia(media);
        } catch (err) {
          console.error("Failed to load image from query:", err);
        }
      }
    };

    initMediaFromQuery();
  }, [queryImageUri, queryImageType]);

  // 处理 OCR 识别（当 ocr=true 时）
  useEffect(() => {
    const handleOcr = async () => {
      // 只有当 ocr=true 且有图片时才执行
      if (queryOcr !== "true" || !queryImageUri) {
        return;
      }

      try {
        // 解码图片 URI
        const decodedUri = decodeURIComponent(queryImageUri);

        // 上传图片以获取可访问的 URL
        const attachment = await uploadAttachment({
          file: { uri: decodedUri, type: "image/jpeg" },
          fileName: `ocr-${Date.now()}.jpg`,
          createdAt: Date.now(),
        });

        // 调用 OCR 识别
        const texts = await parseImage([attachment.url]);

        if (texts && texts.length > 0) {
          // 将识别结果填入内容
          const ocrText = texts.join("\n");
          createMemoService.appendContent(ocrText);
          showSuccess("OCR 识别完成");
        } else {
          showError("OCR 识别失败，未检测到文字");
        }
      } catch (err) {
        console.error("Failed to process OCR:", err);
        showError("OCR 识别失败，请稍后重试");
      }
    };

    handleOcr();
  }, [queryOcr, queryImageUri, createMemoService]);

  // 处理 OCR 识别结果（当从首页传入 ocrContent 时）
  useEffect(() => {
    if (queryOcrContent) {
      try {
        const decodedContent = decodeURIComponent(queryOcrContent);
        createMemoService.appendContent(decodedContent);
      } catch (err) {
        console.error("Failed to decode OCR content:", err);
        // 如果解码失败，尝试直接使用原始内容
        createMemoService.appendContent(queryOcrContent);
      }
    }
  }, [queryOcrContent, createMemoService]);

  // 处理 OCR 图片识别流程（当传入 ocrImageUri 时）
  useEffect(() => {
    const handleOcrFromImage = async () => {
      if (queryOcrImageUri) {
        try {
          // 解码图片 URI
          const decodedUri = decodeURIComponent(queryOcrImageUri);

          // 添加图片到 selectedMedia
          const media = {
            type: "image" as const,
            uri: decodedUri,
            name: `ocr-${Date.now()}.jpg`,
            mimeType: "image/jpeg",
          };
          addMedia(media);

          // 启动 OCR 流程
          await ocrService.processSelectedImage(decodedUri);
        } catch (err) {
          console.error("Failed to process OCR from image:", err);
          showError("OCR 识别失败，请稍后重试");
        }
      }
    };

    handleOcrFromImage();
  }, [queryOcrImageUri, addMedia, ocrService]);

  // 监听 OCR 结果，自动填入内容
  useEffect(() => {
    if (ocrService.ocrResultText && !createMemoService.content) {
      createMemoService.setContent(ocrService.ocrResultText);
    }
  }, [ocrService.ocrResultText, createMemoService]);

  // 监听 OCR 错误
  useEffect(() => {
    if (ocrService.ocrError) {
      showError(ocrService.ocrError);
    }
  }, [ocrService.ocrError]);

  // 处理从外部传入的录音（录音完成后）
  useEffect(() => {
    const initAudioFromQuery = async () => {
      if (queryAudioUri) {
        try {
          // 解码音频 URI
          const decodedUri = decodeURIComponent(queryAudioUri);

          // 保存音频 URI，供后续删除使用
          createMemoService.setAudioUri(decodedUri);

          // 添加音频到 selectedMedia
          const audioMedia = {
            type: "audio" as const,
            uri: decodedUri,
            name: `voice-memo-${Date.now()}.m4a`,
            mimeType: "audio/m4a",
          };
          addMedia(audioMedia);

          // 启动上传和转写流程
          await voiceMemoService.uploadAndTranscribe(decodedUri);
        } catch (err) {
          console.error("Failed to process audio from query:", err);
          showError("语音处理失败，请稍后重试");
        }
      }
    };

    initAudioFromQuery();

    // 组件卸载时清理轮询
    return () => {
      voiceMemoService.stopPolling();
    };
  }, [queryAudioUri, addMedia, createMemoService, voiceMemoService]);

  // 监听转写结果，自动填入内容
  useEffect(() => {
    if (voiceMemoService.transcriptionText && !createMemoService.content) {
      createMemoService.setContent(voiceMemoService.transcriptionText);
    }
  }, [voiceMemoService.transcriptionText, createMemoService]);

  // 监听转写错误
  useEffect(() => {
    if (voiceMemoService.transcriptionError) {
      showError("语音转文字失败，请手动输入");
    }
  }, [voiceMemoService.transcriptionError]);

  // 录音完成处理
  const handleRecordingComplete = useCallback(
    async (audioUri: string) => {
      try {
        // 保存音频 URI
        createMemoService.setAudioUri(audioUri);

        // 添加音频到 selectedMedia
        const audioMedia = {
          type: "audio" as const,
          uri: audioUri,
          name: `voice-memo-${Date.now()}.m4a`,
          mimeType: "audio/m4a",
        };
        addMedia(audioMedia);

        // 启动上传和转写流程
        await voiceMemoService.uploadAndTranscribe(audioUri);
      } catch (err) {
        console.error("Failed to process audio:", err);
        showError("语音处理失败，请稍后重试");
      }
    },
    [addMedia, createMemoService, voiceMemoService],
  );

  // OCR 识别处理
  const [ocrLoading, setOcrLoading] = useState(false);
  const handleOcrPress = useCallback(() => {
    if (ocrLoading) return;
    setOcrPickerVisible(true);
  }, [ocrLoading]);

  // 处理 OCR 来源选择
  const handleOcrSourceSelect = useCallback(
    async (source: OcrSourceType) => {
      setOcrLoading(true);
      try {
        const file = await processOcrSource(source);
        if (!file) {
          setOcrLoading(false);
          return;
        }

        // 上传文件获取 URL
        const attachment = await uploadAttachment({
          file: { uri: file.uri, type: file.mimeType },
          fileName: file.name,
          createdAt: Date.now(),
        });

        // 调用 OCR 识别
        const texts = await parseImage([attachment.url]);

        if (texts && texts.length > 0) {
          // 追加识别结果到内容
          const ocrText = texts.join("\n");
          createMemoService.appendContent(ocrText);
          showSuccess("OCR 识别完成");
        } else {
          showError("OCR 识别失败，未检测到文字");
        }
      } catch (err) {
        console.error("Failed to process OCR:", err);
        showError("OCR 识别失败，请稍后重试");
      } finally {
        setOcrLoading(false);
      }
    },
    [createMemoService],
  );

  // 处理返回
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // 处理提交
  const handleSubmit = useCallback(async () => {
    if (!createMemoService.content.trim()) {
      createMemoService.setError("请输入内容");
      return;
    }

    try {
      const submitMode = await createMemoService.submitMemo(
        queryMemoId,
        selectedMedia,
      );
      showSuccess(submitMode === "edit" ? "编辑成功" : "创建成功");
      router.back();
    } catch (err) {
      const errorMsg =
        createMemoService.error ||
        (err instanceof Error
          ? err.message
          : createMemoService.isEditMode
            ? "编辑失败"
            : "创建失败");
      createMemoService.setError(errorMsg);
      showError(errorMsg);
      console.error(
        createMemoService.isEditMode
          ? "Failed to update memo:"
          : "Failed to create memo:",
        err,
      );
    }
  }, [createMemoService, queryMemoId, selectedMedia, router]);

  if (createMemoService.isLoading && createMemoService.isEditMode) {
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
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.headerIconButton,
            { backgroundColor: theme.colors.backgroundTertiary },
          ]}
          onPress={handleGoBack}
          disabled={createMemoService.submitting}
        >
          <X size={20} color={theme.colors.foreground} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            styles.headerIconButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: createMemoService.submitting ? 0.5 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={createMemoService.submitting}
        >
          {createMemoService.submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Check size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* 内容输入区域 - 铺满中间区域 */}
      <View
        style={[
          styles.inputSection,
          {
            flex: 1,
            backgroundColor: theme.colors.backgroundSecondary,
          },
        ]}
      >
        <TextInput
          style={[
            styles.contentInput,
            {
              flex: 1,
              color: createMemoService.content
                ? theme.colors.foreground
                : theme.colors.foregroundTertiary,
            },
          ]}
          placeholder="输入内容..."
          placeholderTextColor={theme.colors.foregroundTertiary}
          onChangeText={createMemoService.setContent}
          value={createMemoService.content}
          multiline
          scrollEnabled
        />
      </View>

      {/* 标签选择器 - 轻量级，默认收起 */}
      <View
        style={[
          styles.tagSection,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            paddingHorizontal: 16,
            paddingVertical: 8,
            minHeight: 44,
          },
        ]}
      >
        <TagSelector
          selectedTags={createMemoService.selectedTags}
          onChange={createMemoService.setSelectedTags}
          disabled={createMemoService.submitting}
        />
      </View>

      {/* 媒体预览 */}
      {selectedMedia.length > 0 && (
        <View
          style={{
            backgroundColor: theme.colors.background,
          }}
        >
          <MediaPreview media={selectedMedia} onRemove={removeMedia} />
        </View>
      )}

      {/* 转写状态提示 */}
      {voiceMemoService.transcriptionFlowStatus !== "idle" &&
        voiceMemoService.transcriptionFlowStatus !== "success" &&
        voiceMemoService.transcriptionFlowStatus !== "failed" && (
          <View
            style={[
              styles.transcriptionStatusContainer,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text
              style={[
                styles.transcriptionStatusText,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              {voiceMemoService.transcriptionFlowStatus === "uploading" &&
                "正在上传音频..."}
              {voiceMemoService.transcriptionFlowStatus === "submitting" &&
                "正在提交转写任务..."}
              {voiceMemoService.transcriptionFlowStatus === "polling" &&
                "正在转写语音..."}
            </Text>
          </View>
        )}

      {/* 转写失败提示 */}
      {voiceMemoService.transcriptionFlowStatus === "failed" && (
        <View
          style={[
            styles.transcriptionStatusContainer,
            { backgroundColor: theme.colors.destructive + "15" },
          ]}
        >
          <Mic size={16} color={theme.colors.destructive} />
          <Text
            style={[
              styles.transcriptionStatusText,
              { color: theme.colors.destructive },
            ]}
          >
            语音转文字失败，请手动输入
          </Text>
        </View>
      )}

      {/* OCR 状态提示 */}
      {ocrService.ocrFlowStatus !== "idle" &&
        ocrService.ocrFlowStatus !== "success" &&
        ocrService.ocrFlowStatus !== "failed" && (
          <View
            style={[
              styles.transcriptionStatusContainer,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text
              style={[
                styles.transcriptionStatusText,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              {ocrService.ocrFlowStatus === "uploading" && "正在上传图片..."}
              {ocrService.ocrFlowStatus === "recognizing" && "正在识别文字..."}
            </Text>
          </View>
        )}

      {/* OCR 失败提示 */}
      {ocrService.ocrFlowStatus === "failed" && (
        <View
          style={[
            styles.transcriptionStatusContainer,
            { backgroundColor: theme.colors.destructive + "15" },
          ]}
        >
          <ScanText size={16} color={theme.colors.destructive} />
          <Text
            style={[
              styles.transcriptionStatusText,
              { color: theme.colors.destructive },
            ]}
          >
            {ocrService.ocrError || "文字识别失败，请手动输入"}
          </Text>
        </View>
      )}

      {/* 错误信息 */}
      {(createMemoService.error || mediaError) && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme.colors.destructive },
          ]}
        >
          <MaterialIcons name="error" size={18} color="#fff" />
          <Text style={styles.errorText}>
            {createMemoService.error || mediaError}
          </Text>
          <TouchableOpacity
            onPress={() => {
              createMemoService.clearError();
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
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
          },
        ]}
      >
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
            <Camera size={20} color={theme.colors.foregroundSecondary} />
          )}
        </TouchableOpacity>

        {/* 图片按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: mediaLoading ? 0.5 : 1 }]}
          onPress={pickImage}
          disabled={mediaLoading}
        >
          <Image size={20} color={theme.colors.foregroundSecondary} />
        </TouchableOpacity>

        {/* OCR 按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: ocrLoading ? 0.5 : 1 }]}
          onPress={handleOcrPress}
          disabled={ocrLoading}
        >
          {ocrLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.foregroundSecondary}
            />
          ) : (
            <ScanText size={20} color={theme.colors.foregroundSecondary} />
          )}
        </TouchableOpacity>

        {/* 视频按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: mediaLoading ? 0.5 : 1 }]}
          onPress={pickVideo}
          disabled={mediaLoading}
        >
          <Video size={20} color={theme.colors.foregroundSecondary} />
        </TouchableOpacity>

        {/* PDF 按钮 */}
        <TouchableOpacity
          style={[styles.actionButton, { opacity: mediaLoading ? 0.5 : 1 }]}
          onPress={pickPdf}
          disabled={mediaLoading}
        >
          <FileText size={20} color={theme.colors.foregroundSecondary} />
        </TouchableOpacity>

        {/* 录音按钮 */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              opacity:
                voiceMemoService.transcriptionFlowStatus !== "idle" &&
                voiceMemoService.transcriptionFlowStatus !== "success" &&
                voiceMemoService.transcriptionFlowStatus !== "failed"
                  ? 0.5
                  : 1,
            },
          ]}
          onPress={() => setVoiceRecorderVisible(true)}
          disabled={
            voiceMemoService.transcriptionFlowStatus !== "idle" &&
            voiceMemoService.transcriptionFlowStatus !== "success" &&
            voiceMemoService.transcriptionFlowStatus !== "failed"
          }
        >
          <Mic size={20} color={theme.colors.foregroundSecondary} />
        </TouchableOpacity>

        {/* 分类按钮 */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCategoryPickerVisible(true)}
        >
          <MaterialIcons name="folder" size={20} color={theme.colors.foregroundSecondary} />
        </TouchableOpacity>
      </View>

      {/* 分类选择弹窗 */}
      <CategoryPickerModal
        visible={categoryPickerVisible}
        categories={categoryService.categories}
        selectedCategoryId={createMemoService.selectedCategoryId}
        onSelect={(id) => createMemoService.setSelectedCategoryId(id)}
        onClose={() => setCategoryPickerVisible(false)}
      />

      {/* 录音弹窗 */}
      <VoiceRecorderModal
        visible={voiceRecorderVisible}
        onClose={() => setVoiceRecorderVisible(false)}
        onRecordingComplete={handleRecordingComplete}
      />

      {/* OCR 来源选择弹窗 */}
      <OcrSourcePicker
        visible={ocrPickerVisible}
        onClose={() => setOcrPickerVisible(false)}
        onSelectSource={handleOcrSourceSelect}
      />
    </KeyboardAvoidingView>
  );
});

export default bindServices(CreateMemoContent, [
  CreateMemoService,
  CategoryService,
  VoiceMemoService,
]);

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
    borderTopWidth: StyleSheet.hairlineWidth,
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
  // 转写状态
  transcriptionStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  transcriptionStatusText: {
    fontSize: 13,
  },
  // 标签选择器
  tagSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
