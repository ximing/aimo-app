/**
 * Settings Page - 设置页面
 * 支持头像上传、修改昵称、查看邮箱
 */

import AuthService from "@/services/auth-service";
import { useTheme } from "@/hooks/use-theme";
import { showError, showSuccess } from "@/utils/toast";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { bindServices, useService, view } from "@rabjs/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

const SettingsContent = view(() => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authService = useService(AuthService);

  const user = authService.user;
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 选择图片并上传头像
  const handlePickImage = async () => {
    try {
      // 请求权限
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "权限不足",
          "需要访问相册权限才能上传头像，请前往设置开启。"
        );
        return;
      }

      // 启动图片选择器
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setIsUploading(true);

        try {
          await authService.uploadUserAvatar({
            uri: asset.uri,
            type: asset.mimeType || "image/jpeg",
            name: "avatar.jpg",
          });
          showSuccess("头像上传成功");
        } catch (error) {
          showError(error instanceof Error ? error.message : "头像上传失败");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Failed to pick image:", error);
      showError("选择图片失败");
    }
  };

  // 保存昵称
  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      showError("昵称不能为空");
      return;
    }

    if (nickname === user?.nickname) {
      return; // 没有变化，不需要保存
    }

    setIsSaving(true);
    try {
      await authService.updateUserProfile({ nickname: nickname.trim() });
      showSuccess("昵称保存成功");
    } catch (error) {
      showError(error instanceof Error ? error.message : "保存失败");
      // 恢复原来的昵称
      setNickname(user?.nickname || "");
    } finally {
      setIsSaving(false);
    }
  };

  // 用户信息
  const userAvatar = user?.avatar;
  const userEmail = user?.email || "未设置邮箱";
  const userInitial = (user?.nickname || "用户").charAt(0).toUpperCase();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 顶部导航栏 */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + theme.spacing.sm,
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: theme.colors.foreground }]}
        >
          设置
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* 内容区域 */}
      <View style={styles.content}>
        {/* 头像区域 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <MaterialIcons name="hourglass-empty" size={32} color="#fff" />
              </View>
            ) : userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.avatarText}>{userInitial}</Text>
              </View>
            )}
            <View
              style={[
                styles.editBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <MaterialIcons name="edit" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text
            style={[styles.avatarHint, { color: theme.colors.foregroundSecondary }]}
          >
            点击更换头像
          </Text>
        </View>

        {/* 表单区域 */}
        <View style={styles.formSection}>
          {/* 昵称 */}
          <View style={styles.formItem}>
            <Text style={[styles.formLabel, { color: theme.colors.foreground }]}>
              昵称
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.foreground,
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={nickname}
                onChangeText={setNickname}
                placeholder="请输入昵称"
                placeholderTextColor={theme.colors.foregroundSecondary}
                onBlur={handleSaveNickname}
                onSubmitEditing={handleSaveNickname}
              />
              {isSaving && (
                <MaterialIcons
                  name="hourglass-empty"
                  size={20}
                  color={theme.colors.foregroundSecondary}
                  style={styles.savingIndicator}
                />
              )}
            </View>
          </View>

          {/* 邮箱 */}
          <View style={styles.formItem}>
            <Text style={[styles.formLabel, { color: theme.colors.foreground }]}>
              邮箱
            </Text>
            <View
              style={[
                styles.inputContainer,
                styles.readonlyContainer,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.readonlyText,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                {userEmail}
              </Text>
              <MaterialIcons
                name="lock"
                size={16}
                color={theme.colors.foregroundSecondary}
              />
            </View>
            <Text
              style={[
                styles.hint,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              邮箱不可修改
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

// 使用 bindServices 注入 AuthService
export default bindServices(SettingsContent, [AuthService]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "600",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: {
    fontSize: 12,
  },
  formSection: {
    flex: 1,
  },
  formItem: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  savingIndicator: {
    position: "absolute",
    right: 12,
  },
  readonlyContainer: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
  },
  readonlyText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
