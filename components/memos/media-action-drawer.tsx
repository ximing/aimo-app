/**
 * Media Action Drawer Component - 媒体操作底部抽屉
 * 从底部弹出，提供拍照和从相册选择图片功能
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import { view } from "@rabjs/react";
import { Camera, Image, X } from "lucide-react-native";
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

interface MediaActionDrawerProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const MediaActionDrawer = view(
  ({ visible, onClose, onCameraPress, onGalleryPress }: MediaActionDrawerProps) => {
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
        onCameraPress();
      }, 300);
    };

    const handleGalleryPress = () => {
      onClose();
      setTimeout(() => {
        onGalleryPress();
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
                添加媒体
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* 操作选项 */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
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
                <Text style={[styles.actionLabel, { color: theme.colors.foreground }]}>
                  拍照
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
                onPress={handleGalleryPress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.secondary },
                  ]}
                >
                  <Image size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.actionLabel, { color: theme.colors.foreground }]}>
                  图片
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

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
