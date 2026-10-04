/**
 * About Page - 关于页面
 * 展示应用信息、版本信息、检查更新等
 */

import { Button } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { formatProgress, progressRatio, updateActionLabel } from "@/lib/app-update";
import AppUpdateService from "@/services/app-update.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useService, view } from "@rabjs/react";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateService = useService(AppUpdateService);

  // 获取应用信息
  const appName = Constants.expoConfig?.name || "Aimo";
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || "";

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  const handleCheckUpdate = () => {
    void updateService.pressPrimary();
  };
  const phase = updateService.phase;
  const remote = updateService.remote;
  const pendingPermission = updateService.pendingPermission;
  const progress = formatProgress(updateService.bytesDownloaded, updateService.totalBytes);
  const ratio = progressRatio(updateService.bytesDownloaded, updateService.totalBytes);
  const actionLabel =
    phase === "downloading"
      ? `下载中${progress ? ` ${progress}` : ""}`
      : updateActionLabel(phase, pendingPermission);

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
            variant={phase === "ready" || pendingPermission ? "primary" : "outline"}
            size="sm"
            onPress={handleCheckUpdate}
            loading={phase === "checking" || phase === "installing"}
            disabled={phase === "downloading" || phase === "installing"}
            style={styles.updateButton}
          >
            {actionLabel}
          </Button>

          {phase === "downloading" ? (
            <View style={styles.progressBlock}>
              <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.round(ratio * 100)}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.latestVersion, { color: theme.colors.foregroundSecondary }]}>
                {progress ? `正在下载 ${progress}` : "正在下载"}
              </Text>
            </View>
          ) : null}

          {remote && phase !== "idle" ? (
            <Text
              style={[
                styles.latestVersion,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              最新版本 v{remote.versionName}
              {phase === "ready" ? " · 已下载，点按安装" : ""}
              {phase === "failed" ? " · 更新失败" : ""}
            </Text>
          ) : null}
          {pendingPermission ? (
            <Text style={[styles.latestVersion, { color: theme.colors.foregroundSecondary }]}>
              请允许安装未知应用后再试
            </Text>
          ) : null}
          {updateService.error && phase === "failed" ? (
            <Text style={[styles.latestVersion, { color: theme.colors.destructive }]}>
              {updateService.error}
            </Text>
          ) : null}
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
  progressBlock: {
    alignSelf: "stretch",
    marginTop: 12,
    gap: 8,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: 4,
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
});

export default AboutContent;
