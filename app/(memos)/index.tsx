/**
 * Memos List Page - 备忘录列表页面
 */

import {
  FloatingActionBar,
  SearchHeader,
  SidebarDrawer,
} from "@/components/memos";
import { MemoItem } from "@/components/memos/memo-item";
import { useTheme } from "@/hooks/use-theme";
import MemoService from "@/services/memo-service";
import type { Memo } from "@/types/memo";
import { bindServices, useService } from "@rabjs/react";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const MemosListContent = () => {
  const theme = useTheme();
  const router = useRouter();
  const memoService = useService(MemoService);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);

  // 初始化加载列表
  useEffect(() => {
    memoService.refreshMemos();
  }, [memoService]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    memoService.refreshMemos();
  }, [memoService]);

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (memoService.hasMore && !memoService.loading) {
      memoService.loadNextPage();
    }
  }, [memoService]);

  // 处理滚动事件
  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // 滚动距离超过 300 像素时显示回到顶部按钮
    setShowScrollToTop(offsetY > 300);
  }, []);

  // 回到顶部
  const handleScrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // 处理列表项点击
  const handleMemoPress = useCallback(
    (memoId: string) => {
      router.push(`/(memos)/${memoId}`);
    },
    [router],
  );

  // 渲染空状态
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[styles.emptyText, { color: theme.colors.foregroundTertiary }]}
      >
        暂无备忘录
      </Text>
      <Text
        style={[
          styles.emptySubText,
          { color: theme.colors.foregroundSecondary },
        ]}
      >
        下拉刷新或创建新的备忘录
      </Text>
    </View>
  );

  // 渲染列表项
  const renderItem = ({ item }: { item: Memo }) => (
    <MemoItem memo={item} onPress={handleMemoPress} />
  );

  // 渲染页脚（加载更多指示器）
  const renderFooter = () => {
    // 只在有列表项且正在加载时显示
    if (memoService.memos.length === 0) {
      return null;
    }
    
    // 只在加载更多时显示（不是初始加载）
    if (memoService.loading && memoService.currentPage > 1) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={theme.colors.info} />
        </View>
      );
    }
    
    return null;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* 搜索头部 */}
      <SearchHeader onDrawerToggle={() => setDrawerVisible(!drawerVisible)} />

      {/* 侧边栏抽屉 */}
      <SidebarDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* 列表 */}
      <FlatList
        ref={flatListRef}
        data={memoService.memos}
        renderItem={renderItem}
        keyExtractor={(item) => item.memoId}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={memoService.loading && memoService.currentPage === 1}
            onRefresh={handleRefresh}
            tintColor={theme.colors.info}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* 回到顶部按钮 */}
      {showScrollToTop && (
        <TouchableOpacity
          style={[
            styles.scrollToTopButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleScrollToTop}
          activeOpacity={0.8}
        >
          <MaterialIcons name="arrow-upward" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* 底部悬浮操作栏 */}
      <FloatingActionBar />

      {/* 显示错误信息 */}
      {memoService.error && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme.colors.destructive },
          ]}
        >
          <Text style={styles.errorText}>{memoService.error}</Text>
        </View>
      )}
    </View>
  );
};

export default bindServices(MemosListContent, []);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
  },
  // 页脚
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  // 错误信息
  errorContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    color: "#fff", // 错误文本用白色显示在错误背景上
  },
  // 回到顶部按钮
  scrollToTopButton: {
    position: "absolute",
    bottom: 100,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
});
