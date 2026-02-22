/**
 * About Page - 关于页面
 * 展示应用信息、版本信息、检查更新等
 */

import { Button } from "@/components/ui";
import { Colors } from "@/constants/theme-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import UpdateService from "@/services/update-service";
import { MaterialIcons } from "@expo/vector-icons";
import { bindServices, useService, view } from "@rabjs/react";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AboutContent = view(() => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateService = useService(UpdateService);

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // 获取应用信息
  const appName = Constants.expoConfig?.name || "Aimo";
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || "";

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 检查更新
  const handleCheckUpdate = async () => {
    const hasUpdate = await updateService.checkForUpdate();
    if (hasUpdate) {
      setShowUpdateDialog(true);
    } else if (updateService.error) {
      Alert.alert("检查更新失败", updateService.error);
    } else {
      Alert.alert("已是最新版本", `当前版本 ${appVersion} 已是最新版本`);
    }
  };

  // 跳转到外部链接
  const handleLinkPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      {/* 顶部导航栏 */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.foreground }]}>
          关于
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 应用Logo和名称 - 卡片样式 */}
        <View
          style={[
            styles.appInfoCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={
                theme.isDark
                  ? require("@/assets/logo-dark.png")
                  : require("@/assets/logo.png")
              }
              style={styles.appLogo}
              contentFit="contain"
            />
          </View>
          <Text style={[styles.appName, { color: theme.colors.foreground }]}>
            {appName}
          </Text>
          <Text
            style={[
              styles.appVersion,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            版本 {appVersion}
            {buildNumber ? ` (${buildNumber})` : ""}
          </Text>

          {/* 检查更新按钮 */}
          <Button
            variant="outline"
            size="sm"
            onPress={handleCheckUpdate}
            loading={updateService.loading}
            style={styles.updateButton}
          >
            {updateService.loading ? "检查中..." : "检查更新"}
          </Button>

          {/* 最新版本提示 */}
          {updateService.latestVersion && (
            <Text
              style={[
                styles.latestVersion,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              最新版本: {updateService.latestVersion}
              {updateService.hasUpdate && (
                <Text style={{ color: colors.primary }}> (有更新)</Text>
              )}
            </Text>
          )}
        </View>

        {/* 应用信息列表 - 卡片样式 */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            应用信息
          </Text>

          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <MaterialIcons
                name="info-outline"
                size={20}
                color={theme.colors.foregroundSecondary}
              />
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                应用名称
              </Text>
            </View>
            <Text
              style={[styles.infoValue, { color: theme.colors.foreground }]}
            >
              {appName}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <MaterialIcons
                name="new-releases"
                size={20}
                color={theme.colors.foregroundSecondary}
              />
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                版本号
              </Text>
            </View>
            <Text
              style={[styles.infoValue, { color: theme.colors.foreground }]}
            >
              {appVersion}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <MaterialIcons
                name="fingerprint"
                size={20}
                color={theme.colors.foregroundSecondary}
              />
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                应用标识
              </Text>
            </View>
            <Text
              style={[
                styles.infoValue,
                { color: theme.colors.foreground },
              ]}
              numberOfLines={1}
            >
              {Constants.expoConfig?.ios?.bundleIdentifier ||
                Constants.expoConfig?.android?.package ||
                "-"}
            </Text>
          </View>
        </View>

        {/* 链接信息 - 卡片样式 */}
        <View
          style={[
            styles.linkCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            链接
          </Text>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() =>
              handleLinkPress("https://github.com/ximing/aimo-app")
            }
          >
            <View style={styles.linkItemLeft}>
              <MaterialIcons
                name="code"
                size={20}
                color={theme.colors.foregroundSecondary}
              />
              <Text
                style={[styles.linkLabel, { color: theme.colors.foreground }]}
              >
                GitHub
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.colors.foregroundSecondary}
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() =>
              handleLinkPress("https://github.com/ximing/aimo-app/releases")
            }
          >
            <View style={styles.linkItemLeft}>
              <MaterialIcons
                name="new-releases"
                size={20}
                color={theme.colors.foregroundSecondary}
              />
              <Text
                style={[styles.linkLabel, { color: theme.colors.foreground }]}
              >
                Release Notes
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.colors.foregroundSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* 开发者信息 - 卡片样式 */}
        <View
          style={[
            styles.developerCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            开发者
          </Text>

          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <MaterialIcons
                name="person-outline"
                size={20}
                color={theme.colors.foregroundSecondary}
              />
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                作者
              </Text>
            </View>
            <Text
              style={[styles.infoValue, { color: theme.colors.foreground }]}
            >
              ximing
            </Text>
          </View>
        </View>

        {/* 版权信息 */}
        <View style={styles.copyrightSection}>
          <Text
            style={[
              styles.copyrightText,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            © 2024 {appName}. All rights reserved.
          </Text>
          <Text
            style={[
              styles.copyrightText,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            Built with React Native + Expo
          </Text>
        </View>
      </ScrollView>

      {/* 更新对话框 */}
      {showUpdateDialog && updateService.latestRelease && (
        <View style={styles.dialogOverlay}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text
              style={[styles.dialogTitle, { color: theme.colors.foreground }]}
            >
              发现新版本
            </Text>

            <View style={styles.dialogVersionInfo}>
              <Text
                style={[
                  styles.dialogVersionText,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                当前版本: {appVersion}
              </Text>
              <Text
                style={[
                  styles.dialogVersionText,
                  { color: colors.primary },
                ]}
              >
                最新版本: {updateService.latestVersion}
              </Text>
            </View>

            {updateService.latestRelease.body && (
              <View
                style={[
                  styles.dialogReleaseNotes,
                  { backgroundColor: theme.colors.muted },
                ]}
              >
                <Text
                  style={[
                    styles.dialogReleaseLabel,
                    { color: theme.colors.foregroundSecondary },
                  ]}
                >
                  更新内容:
                </Text>
                <Text
                  style={[
                    styles.dialogReleaseText,
                    { color: theme.colors.foreground },
                  ]}
                  numberOfLines={4}
                >
                  {updateService.latestRelease.body}
                </Text>
              </View>
            )}

            <View style={styles.dialogButtonGroup}>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowUpdateDialog(false)}
                style={styles.dialogButton}
                disabled={updateService.downloading}
              >
                稍后再说
              </Button>
              <Button
                variant="primary"
                size="sm"
                onPress={() => {
                  updateService.downloadAndInstallApk();
                }}
                style={styles.dialogButton}
                loading={updateService.downloading}
                disabled={updateService.downloading}
              >
                {updateService.downloading ? `下载中 ${updateService.downloadProgress}%` : "下载并安装"}
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  appInfoCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  logoContainer: {
    marginBottom: 16,
  },
  appLogo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 16,
  },
  updateButton: {
    minWidth: 120,
  },
  latestVersion: {
    fontSize: 12,
    marginTop: 8,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    maxWidth: "50%",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  linkCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  linkItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkLabel: {
    fontSize: 14,
  },
  developerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  copyrightSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  copyrightText: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  // 对话框样式
  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  dialogVersionInfo: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  dialogVersionText: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 4,
  },
  dialogReleaseNotes: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dialogReleaseLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  dialogReleaseText: {
    fontSize: 12,
    lineHeight: 18,
  },
  dialogButtonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  dialogButton: {
    flex: 1,
  },
});

export default bindServices(AboutContent, [UpdateService]);
