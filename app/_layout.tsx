import { register, RSRoot, RSStrict, useService, view } from "@rabjs/react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { getTokenAsync, onUnauthorized } from "@/api/common";
import { ErrorBoundary } from "@/components/error-boundary";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AuthService from "@/services/auth-service";
import MemoService from "@/services/memo-service";
register(AuthService);
register(MemoService);

const Layout = view(() => {
  const colorScheme = useColorScheme();
  const authService = useService(AuthService);
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化时检查是否已登录（仅执行一次）
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getTokenAsync();
        if (token) {
          // 如果有存储的 token，标记为已认证
          authService.isAuthenticated = true;
        }
      } catch (err) {
        console.error("Failed to check authentication:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // 监听 401 未授权错误（仅在挂载时注册一次）
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      try {
        // 清除认证状态
        authService.isAuthenticated = false;
        authService.user = null;
        // 等待导航栏准备好后再跳转
        if (navigationState?.key) {
          router.replace("/auth");
        }
      } catch (error) {
        console.error("Error in onUnauthorized callback:", error);
      }
    });

    return unsubscribe;
  }, []);

  // 监听认证状态变化，处理路由导航
  useEffect(() => {
    if (!isInitialized) return;

    if (authService.isAuthenticated) {
      // 已认证，导航到 memos
      router.replace("/(memos)");
    } else {
      // 未认证，导航到 auth
      router.replace("/auth");
    }
  }, [authService.isAuthenticated, isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ErrorBoundary>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* 声明所有可能的屏幕，导航逻辑在上面处理 */}
          <Stack.Screen name="(memos)" />
          <Stack.Screen name="auth" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ErrorBoundary>
    </ThemeProvider>
  );
});

const Root = () => {
  return (
    <RSRoot>
      <RSStrict>
        <Layout />
      </RSStrict>
    </RSRoot>
  );
};
export default Root;
