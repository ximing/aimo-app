import { register, RSRoot, RSStrict, useService, view } from "@rabjs/react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";
import "react-native-reanimated";

import { getTokenAsync, onUnauthorized, saveToken } from "@/api/common";
import { ErrorBoundary } from "@/components/error-boundary";
import { SplashScreen } from "@/components/splash-screen";
import { UpdateHost } from "@/components/update-host";
import { Toast } from "@/components/ui";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AuthService from "@/services/auth-service";
import CategoryService from "@/services/category-service";
import FilterService from "@/services/filter-service";
import MemoService from "@/services/memo-service";
import OcrService from "@/services/ocr-service";
import RecommendationService from "@/services/recommendation.service";
import SearchService from "@/services/search-service";
import TagService from "@/services/tag-service";
import ThemeService from "@/services/theme-service";
import AppUpdateService from "@/services/app-update.service";
import { askHuaweiNotificationPermission, syncHuaweiPush } from "@/lib/huawei-push";
import { parsePushUrl, routeForPushTarget, type PushTarget } from "@/lib/push-target";

register(AuthService);
register(CategoryService);
register(TagService);
register(FilterService);
register(MemoService);
register(OcrService);
register(RecommendationService);
register(SearchService);
register(ThemeService);
register(AppUpdateService);

const Layout = view(() => {
  const systemColorScheme = useColorScheme();
  const authService = useService(AuthService);
  const themeService = useService(ThemeService);
  const updateService = useService(AppUpdateService);
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isInitialized, setIsInitialized] = useState(false);
  const pendingPush = useRef<PushTarget | null>(null);
  const authedRef = useRef(false);
  const navReadyRef = useRef(false);
  authedRef.current = authService.isAuthenticated;
  navReadyRef.current = Boolean(navigationState?.key);

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
          saveToken(token);
          // 如果有存储的 token，标记为已认证
          authService.isAuthenticated = true;
          authService.fetchUserInfo().catch((error) => {
            console.warn("Failed to fetch user info on init:", error);
          });
        }

      } catch (err) {
        console.error("Failed to initialize app:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initApp();
    updateService.start();
    return () => updateService.stop();
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
      const target = pendingPush.current;
      pendingPush.current = null;
      router.replace(target ? routeForPushTarget(target) : "/(memos)");
      syncHuaweiPush();
    } else {
      // 未认证，导航到 auth
      router.replace("/auth");
    }
  }, [authService.isAuthenticated, isInitialized]);

  useEffect(() => {
    const openUrl = (url: string | null) => {
      const target = parsePushUrl(url);
      if (!target) return;
      if (authedRef.current && navReadyRef.current) {
        router.push(routeForPushTarget(target));
        return;
      }
      pendingPush.current = target;
    };

    Linking.getInitialURL()
      .then(openUrl)
      .catch(() => undefined);
    askHuaweiNotificationPermission();
    const linkSub = Linking.addEventListener("url", (event) => openUrl(event.url));
    const appSub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      if (authedRef.current) {
        syncHuaweiPush();
        return;
      }
      askHuaweiNotificationPermission();
    });
    return () => {
      linkSub.remove();
      appSub.remove();
    };
  }, [router]);

  if (!isInitialized) {
    return <SplashScreen />;
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
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
        <Toast />
        <UpdateHost />
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
