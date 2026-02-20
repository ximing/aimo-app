/**
 * Floating Action Bar Component - 底部浮动操作栏
 * 包含语音、新增、编辑按钮
 * 使用 @rabjs/react 的 view 装饰器以响应主题变化
 * 页面特定组件：仅在 (memos) 页面使用
 */

import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/use-theme";
import { view } from "@rabjs/react";
import { useRouter } from "expo-router";
import { FileText, Mic, MoreHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MediaActionDrawer } from "./media-action-drawer";

interface FloatingActionBarProps {
  onMicPress?: () => void;
  onAddPress?: () => void;
}

export const FloatingActionBar = view(
  ({ onMicPress, onAddPress }: FloatingActionBarProps) => {
    const theme = useTheme();
    const router = useRouter();
    const [drawerVisible, setDrawerVisible] = useState(false);

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
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

    // 关闭抽屉
    const handleDrawerClose = React.useCallback(() => {
      setDrawerVisible(false);
    }, []);

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
          <TouchableOpacity style={styles.actionButton} onPress={onMicPress}>
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

          <TouchableOpacity style={styles.actionButton} onPress={handleMorePress}>
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
