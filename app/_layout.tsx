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
import { Toast } from "@/components/ui/toast";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AuthService from "@/services/auth-service";
import MemoService from "@/services/memo-service";
import ThemeService from "@/services/theme-service";
register(AuthService);
register(MemoService);
register(ThemeService);

const Layout = view(() => {
  const systemColorScheme = useColorScheme();
  const authService = useService(AuthService);
  const themeService = useService(ThemeService);
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isInitialized, setIsInitialized] = useState(false);

  // 获取实际使用的颜色方案（考虑 ThemeService 的设置）
  const colorScheme = themeService.colorScheme;

  // 初始化时检查是否已登录并初始化主题（仅执行一次）
  useEffect(() => {
    const initApp = async () => {
      try {
        // 初始化主题服务
        await themeService.initialize();
        
        // 检查是否已登录
        const token = await getTokenAsync();
        if (token) {
          // 如果有存储的 token，标记为已认证
          authService.isAuthenticated = true;
        }
      } catch (err) {
        console.error("Failed to initialize app:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initApp();
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
        <Toast />
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
