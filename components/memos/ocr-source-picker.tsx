/**
 * OCR Source Picker Component - OCR 来源选择弹窗
 * 从底部弹出，提供拍照、从相册选择、从文件选择功能
 */

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/use-theme";
import { view } from "@rabjs/react";
import { Camera, FileText, Image, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type OcrSourceType = "camera" | "gallery" | "file";

interface OcrSourcePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectSource: (source: OcrSourceType) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const OcrSourcePicker = view(
  ({ visible, onClose, onSelectSource }: OcrSourcePickerProps) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, translateY, opacity]);

    const handleCameraPress = () => {
      onClose();
      setTimeout(() => {
        onSelectSource("camera");
      }, 300);
    };

    const handleGalleryPress = () => {
      onClose();
      setTimeout(() => {
        onSelectSource("gallery");
      }, 300);
    };

    const handleFilePress = () => {
      onClose();
      setTimeout(() => {
        onSelectSource("file");
      }, 300);
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity,
              },
            ]}
          >
            <Pressable style={styles.backdropPressable} onPress={onClose} />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawerContent,
              {
                backgroundColor: theme.colors.card,
                paddingBottom: insets.bottom + 16,
                transform: [{ translateY }],
              },
            ]}
          >
            {/* 拖动条 */}
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            </View>

            {/* 标题和关闭按钮 */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.foreground }]}>
                OCR 识别
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* 操作选项 */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.background },
                ]}
                onPress={handleCameraPress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Camera size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.colors.foreground },
                  ]}
                >
                  拍照
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.background },
                ]}
                onPress={handleGalleryPress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Image size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.colors.foreground },
                  ]}
                >
                  相册
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.background },
                ]}
                onPress={handleFilePress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <FileText size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.colors.foreground },
                  ]}
                >
                  文件
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

/**
 * 处理 OCR 来源选择的具体逻辑
 * 返回处理后的文件 URI 和类型
 */
export interface OcrFileResult {
  uri: string;
  type: "image" | "pdf";
  name: string;
  mimeType: string;
}

/**
 * 根据来源类型执行 OCR 文件选择
 */
export const handleOcrSourceSelect = async (
  source: OcrSourceType
): Promise<OcrFileResult | null> => {
  try {
    switch (source) {
      case "camera": {
        // 拍照
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          return null;
        }

        const cameraResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (cameraResult.canceled || !cameraResult.assets?.length) {
          return null;
        }

        const asset = cameraResult.assets[0];
        return {
          uri: asset.uri,
          type: "image",
          name: `ocr-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
        };
      }

      case "gallery": {
        // 从相册选择
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          return null;
        }

        const galleryResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (galleryResult.canceled || !galleryResult.assets?.length) {
          return null;
        }

        const asset = galleryResult.assets[0];
        return {
          uri: asset.uri,
          type: "image",
          name: `ocr-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
        };
      }

      case "file": {
        // 选择 PDF 文件
        const fileResult = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          copyToCacheDirectory: true,
        });

        if (fileResult.canceled || !fileResult.assets?.length) {
          return null;
        }

        const doc = fileResult.assets[0];
        return {
          uri: doc.uri,
          type: "pdf",
          name: doc.name || `ocr-${Date.now()}.pdf`,
          mimeType: "application/pdf",
        };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error("OCR source select error:", error);
    return null;
  }
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropPressable: {
    flex: 1,
  },
  drawerContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handleContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
});
