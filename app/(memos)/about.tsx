/**
 * About Page - 关于页面
 * 展示应用信息、版本信息等
 */

import { useTheme } from "@/hooks/use-theme";
import { MaterialIcons } from "@expo/vector-icons";
import { bindServices, view } from "@rabjs/react";
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

  // 获取应用信息
  const appName = Constants.expoConfig?.name || "Aimo";
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || "";

  // 处理返回
  const handleBack = () => {
    router.back();
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
        {/* 应用Logo和名称 */}
        <View style={styles.appInfoSection}>
          <Image
            source={
              theme.isDark
                ? require("@/assets/logo-dark.png")
                : require("@/assets/logo.png")
            }
            style={styles.appLogo}
            contentFit="contain"
          />
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
        </View>

        {/* 分隔线 */}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        {/* 应用信息列表 */}
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Text
              style={[
                styles.infoLabel,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              应用名称
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.foreground }]}
            >
              {appName}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <View style={styles.infoItem}>
            <Text
              style={[
                styles.infoLabel,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              版本号
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.foreground }]}
            >
              {appVersion}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <View style={styles.infoItem}>
            <Text
              style={[
                styles.infoLabel,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              应用标识
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.foreground }]}
            >
              {Constants.expoConfig?.ios?.bundleIdentifier ||
                Constants.expoConfig?.android?.package ||
                "-"}
            </Text>
          </View>
        </View>

        {/* 分隔线 */}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        {/* 开发者信息 */}
        <View style={styles.developerSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.foregroundSecondary },
            ]}
          >
            开发者
          </Text>
          <Text
            style={[styles.developerText, { color: theme.colors.foreground }]}
          >
            ximing
          </Text>
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
            由 React Native + Expo 构建
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
    padding: 24,
  },
  appInfoSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  appLogo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  infoList: {
    borderRadius: 12,
    overflow: "hidden",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  developerSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  developerText: {
    fontSize: 15,
  },
  copyrightSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  copyrightText: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
});

export default bindServices(AboutContent, []);
