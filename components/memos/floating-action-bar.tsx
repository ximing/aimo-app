/**
 * Floating Action Bar Component - 底部浮动操作栏
 * 包含语音、新增、编辑按钮
 * 使用 @rabjs/react 的 view 装饰器以响应主题变化
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { uploadAttachment } from "@/api/attachment";
import { parseImage } from "@/api/ocr";
import { useTheme } from "@/hooks/use-theme";
import { showError, showSuccess } from "@/utils/toast";
import { view } from "@rabjs/react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { FileText, Mic, MoreHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MediaActionDrawer } from "./media-action-drawer";
import {
  OcrSourcePicker,
  OcrSourceType,
  handleOcrSourceSelect as processOcrSource,
} from "./ocr-source-picker";
import { VoiceRecorderModal } from "./voice-recorder-modal";

interface FloatingActionBarProps {
  onMicPress?: () => void;
  onAddPress?: () => void;
}

export const FloatingActionBar = view(
  ({ onMicPress, onAddPress }: FloatingActionBarProps) => {
    const theme = useTheme();
    const router = useRouter();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [voiceRecorderVisible, setVoiceRecorderVisible] = useState(false);
    const [ocrPickerVisible, setOcrPickerVisible] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);

    const handleAddPress = React.useCallback(() => {
      if (onAddPress) {
        onAddPress();
      } else {
        // 默认行为：导航到创建页面
        router.push("/(memos)/create");
      }
    }, [onAddPress, router]);

    // 处理更多按钮点击 - 显示底部抽屉
    const handleMorePress = React.useCallback(() => {
      setDrawerVisible(true);
    }, []);

    // 拍照
    const handleCameraPress = React.useCallback(async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const imageUri = encodeURIComponent(asset.uri);
          router.push(`/(memos)/create?imageUri=${imageUri}&imageType=image`);
        }
      } catch (error) {
        console.error("Camera error:", error);
      }
    }, [router]);

    // 从相册选择图片
    const handleGalleryPress = React.useCallback(async () => {
      try {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const imageUri = encodeURIComponent(asset.uri);
          router.push(`/(memos)/create?imageUri=${imageUri}&imageType=image`);
        }
      } catch (error) {
        console.error("Gallery error:", error);
      }
    }, [router]);

    // 显示 OCR 来源选择弹窗
    const handleOcrPress = React.useCallback(() => {
      setOcrPickerVisible(true);
    }, []);

    // 处理 OCR 来源选择
    const handleOcrSourceSelect = React.useCallback(
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
          const results = await parseImage([attachment.url]);

          if (results && results.length > 0 && results[0].success) {
            // 识别成功，跳转到创建页面并填入 OCR 结果
            const ocrText = results[0].texts.join("\n");
            const encodedContent = encodeURIComponent(ocrText);
            router.push(`/(memos)/create?ocrContent=${encodedContent}`);
            showSuccess("OCR 识别完成");
          } else {
            const errorMsg = results?.[0]?.errorMessage || "OCR 识别失败";
            showError(errorMsg);
          }
        } catch (error) {
          console.error("OCR processing error:", error);
          showError("OCR 识别失败，请稍后重试");
        } finally {
          setOcrLoading(false);
        }
      },
      [router],
    );

    // 关闭抽屉
    const handleDrawerClose = React.useCallback(() => {
      setDrawerVisible(false);
    }, []);

    // 处理录音按钮点击
    const handleMicPress = React.useCallback(() => {
      if (onMicPress) {
        onMicPress();
      } else {
        setVoiceRecorderVisible(true);
      }
    }, [onMicPress]);

    // 关闭录音浮层
    const handleVoiceRecorderClose = React.useCallback(() => {
      setVoiceRecorderVisible(false);
    }, []);

    // 录音完成
    const handleRecordingComplete = React.useCallback(
      (audioUri: string) => {
        // 跳转到创建页面，传递音频 URI
        const encodedUri = encodeURIComponent(audioUri);
        router.push(`/(memos)/create?audioUri=${encodedUri}`);
      },
      [router],
    );

    return (
      <View style={styles.floatingActionBarWrapper}>
        <View
          style={[
            styles.floatingActionBar,
            {
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...theme.shadows.lg,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMicPress}
          >
            <Mic size={18} color={theme.colors.foreground} />
            <Text
              style={[styles.actionLabel, { color: theme.colors.foreground }]}
            >
              录音
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddPress}
          >
            <FileText size={18} color={theme.colors.foreground} />
            <Text
              style={[styles.actionLabel, { color: theme.colors.foreground }]}
            >
              文本
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMorePress}
          >
            <MoreHorizontal size={18} color={theme.colors.foreground} />
            <Text
              style={[styles.actionLabel, { color: theme.colors.foreground }]}
            >
              更多
            </Text>
          </TouchableOpacity>
        </View>

        {/* 媒体操作抽屉 */}
        <MediaActionDrawer
          visible={drawerVisible}
          onClose={handleDrawerClose}
          onCameraPress={handleCameraPress}
          onGalleryPress={handleGalleryPress}
          onOcrPress={handleOcrPress}
        />

        {/* OCR 来源选择弹窗 */}
        <OcrSourcePicker
          visible={ocrPickerVisible}
          onClose={() => setOcrPickerVisible(false)}
          onSelectSource={handleOcrSourceSelect}
        />

        {/* 录音浮层 */}
        <VoiceRecorderModal
          visible={voiceRecorderVisible}
          onClose={handleVoiceRecorderClose}
          onRecordingComplete={handleRecordingComplete}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  floatingActionBarWrapper: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 100,
    pointerEvents: "box-none",
    marginHorizontal: 30,
  },
  floatingActionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignSelf: "center",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  actionLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
