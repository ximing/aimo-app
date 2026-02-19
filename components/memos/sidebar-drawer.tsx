/**
 * Sidebar Drawer Component - 侧边栏抽屉
 * 包含用户信息、菜单项、登出功能、主题切换
 *
 * 功能：
 * - 用户信息展示
 * - 个人资料、设置、帮助等菜单项
 * - 深色/浅色主题切换（基于 ThemeService）
 * - 登出功能
 *
 * 主题切换原理：
 * - 点击"深色模式"/"浅色模式"菜单项触发 themeService.toggleTheme()
 * - ThemeService 管理主题状态并持久化到 AsyncStorage
 * - useTheme() Hook 会响应主题变化，自动更新所有组件的颜色
 *
 * 页面特定组件：仅在 (memos) 页面使用
 */

import { useTheme } from "@/hooks/use-theme";
import AuthService from "@/services/auth-service";
import MemoService from "@/services/memo-service";
import ThemeService from "@/services/theme-service";
import { MaterialIcons } from "@expo/vector-icons";
import { useService, view } from "@rabjs/react";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityHeatmap } from "./activity-heatmap";

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const SidebarDrawer = view(
  ({ visible, onClose }: SidebarDrawerProps) => {
    const theme = useTheme();
    const authService = useService(AuthService);
    const memoService = useService(MemoService);
    const themeService = useService(ThemeService);
    const insets = useSafeAreaInsets();
    const userName =
      authService.user?.nickname || authService.user?.email || "用户";
    const userEmail = authService.user?.email;
    const userAvatar = authService.user?.avatar;
    const userInitial = userName.charAt(0).toUpperCase();
    // 获取活动统计数据
    useEffect(() => {
      if (visible) {
        memoService.fetchActivityStats(90);
      }
    }, [visible, memoService]);

    // 动画值
    const slideAnim = useRef(new Animated.Value(-280)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // 触发动画
    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -280,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, slideAnim, opacityAnim]);

    if (!visible) {
      // 延迟渲染，等待动画完成
      return null;
    }

    return (
      <>
        {/* 背景覆盖层 */}
        <Animated.View
          style={[
            styles.drawerOverlay,
            {
              opacity: opacityAnim,
              backgroundColor: theme.colors.overlay,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* 抽屉内容 */}
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              backgroundColor: theme.colors.background,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* 账号信息区域 */}
          <View
            style={[
              styles.userInfoSection,
              { paddingTop: insets.top + theme.spacing.lg },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              {userAvatar ? (
                <Image
                  source={{ uri: userAvatar }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>{userInitial}</Text>
              )}
            </View>

            <View style={styles.userDetails}>
              <Text
                style={[styles.userName, { color: theme.colors.foreground }]}
                numberOfLines={1}
              >
                {userName}
              </Text>
              {userEmail ? (
                <Text
                  style={[
                    styles.userMeta,
                    { color: theme.colors.foregroundSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {userEmail}
                </Text>
              ) : null}
            </View>
          </View>

          {/* 活动热力图 */}
          <ActivityHeatmap
            data={memoService.activityStats?.items || []}
            isLoading={memoService.activityStatsLoading}
          />

          {/* 分隔线 */}
          <View
            style={[
              styles.drawerDivider,
              { backgroundColor: theme.colors.border },
            ]}
          />

          {/* 菜单项 */}
          <TouchableOpacity style={styles.drawerMenuItem}>
            <MaterialIcons
              name="person"
              size={20}
              color={theme.colors.foregroundSecondary}
            />
            <Text
              style={[
                styles.drawerMenuText,
                { color: theme.colors.foreground },
              ]}
            >
              个人资料
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerMenuItem}>
            <MaterialIcons
              name="settings"
              size={20}
              color={theme.colors.foregroundSecondary}
            />
            <Text
              style={[
                styles.drawerMenuText,
                { color: theme.colors.foreground },
              ]}
            >
              设置
            </Text>
          </TouchableOpacity>

          {/* 主题切换菜单项 */}
          <TouchableOpacity
            style={styles.drawerMenuItem}
            onPress={() => themeService.toggleTheme()}
          >
            <MaterialIcons
              name={theme.isDark ? "light-mode" : "dark-mode"}
              size={20}
              color={theme.colors.foregroundSecondary}
            />
            <Text
              style={[
                styles.drawerMenuText,
                { color: theme.colors.foreground },
              ]}
            >
              {theme.isDark ? "浅色模式" : "深色模式"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerMenuItem}>
            <MaterialIcons
              name="help"
              size={20}
              color={theme.colors.foregroundSecondary}
            />
            <Text
              style={[
                styles.drawerMenuText,
                { color: theme.colors.foreground },
              ]}
            >
              帮助
            </Text>
          </TouchableOpacity>

          {/* 分隔线 */}
          <View
            style={[styles.drawerDivider, { backgroundColor: "transparent" }]}
          />

          {/* 登出按钮 */}
          <TouchableOpacity style={styles.drawerMenuItem}>
            <MaterialIcons
              name="logout"
              size={20}
              color={theme.colors.destructive}
            />
            <Text
              style={[
                styles.drawerMenuText,
                { color: theme.colors.destructive },
              ]}
            >
              登出
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </>
    );
  },
);

const styles = StyleSheet.create({
  drawerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  drawerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "70%",
    maxWidth: 280,
    zIndex: 201,
  },
  userInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 12,
  },
  drawerMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  drawerMenuText: {
    fontSize: 14,
    marginLeft: 12,
  },
  drawerDivider: {
    height: 1,
    marginVertical: 8,
  },
});
