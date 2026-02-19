/**
 * Memo Detail Page - 备忘录详情页
 * 显示单个备忘录的完整信息和相关笔记
 */

import {
  AttachmentGrid,
  ImageViewer,
  RelatedMemoList,
  VideoPlayer,
} from "@/components/memos";
import { useTheme } from "@/hooks/use-theme";
import MemoService from "@/services/memo-service";
import RelatedMemoService from "@/services/related-memo-service";
import type { AttachmentDto } from "@/types/memo";
import { getFileTypeFromMime } from "@/utils/attachment";
import { showSuccess } from "@/utils/toast";
import { MaterialIcons } from "@expo/vector-icons";
import { Sparkles } from "lucide-react-native";
import { bindServices, useService, view } from "@rabjs/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Clipboard,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoDetailContent = view(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const memoService = useService(MemoService);
  const relatedMemoService = useService(RelatedMemoService);

  // 菜单相关状态 - 必须在最前面
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // 图片和视频查看器状态
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<AttachmentDto | null>(
    null,
  );

  // 动画值
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // 初始加载详情
  useEffect(() => {
    if (id) {
      memoService.fetchMemoDetail(id).catch((err) => {
        console.error("加载详情失败:", err);
      });
    }

    // 页面卸载时清除详情数据
    return () => {
      memoService.clearDetail();
    };
  }, [id, memoService]);

  // 菜单动画
  useEffect(() => {
    if (menuVisible) {
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
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuVisible, slideAnim, opacityAnim]);

  // 格式化时间
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 处理附件点击
  const handleAttachmentPress = (attachment: AttachmentDto) => {
    const fileType = getFileTypeFromMime(attachment.type);

    if (fileType === "image") {
      const imageAttachments =
        memoService.currentMemo?.attachments?.filter(
          (att) => getFileTypeFromMime(att.type) === "image",
        ) || [];
      const imageIndex = imageAttachments.findIndex(
        (att) => att.attachmentId === attachment.attachmentId,
      );
      setSelectedImageIndex(imageIndex >= 0 ? imageIndex : 0);
      setImageViewerVisible(true);
    } else if (fileType === "video") {
      setSelectedVideo(attachment);
      setVideoPlayerVisible(true);
    }
  };

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 处理相关笔记点击
  const handleRelatedMemoPress = (memoId: string) => {
    router.push(`/(memos)/${memoId}`);
  };

  const handlePageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!id) return;
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 120;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (
        isCloseToBottom &&
        relatedMemoService.hasMore &&
        !relatedMemoService.loading
      ) {
        relatedMemoService.loadRelatedMemos(id).catch((err) => {
          console.error("加载更多相关笔记失败:", err);
        });
      }
    },
    [id, relatedMemoService],
  );

  // 处理编辑
  const handleEdit = () => {
    setMenuVisible(false);
    router.push(`/(memos)/create?memoId=${memo?.memoId}`);
  };

  // 处理复制
  const handleCopy = () => {
    setMenuVisible(false);
    if (memo?.content) {
      Clipboard.setString(memo.content);
      showSuccess("已复制到剪贴板");
    }
  };

  // 处理删除
  const handleDelete = () => {
    setMenuVisible(false);
    setDeleteConfirmVisible(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    setDeleteConfirmVisible(false);
    try {
      if (memo?.memoId) {
        await memoService.deleteMemo(memo.memoId);
        router.back();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  // 取消删除
  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
  };

  // 加载状态
  if (memoService.detailLoading && !memoService.currentMemo) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.info} />
      </View>
    );
  }

  // 错误状态
  if (memoService.detailError && !memoService.currentMemo) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <MaterialIcons
          name="error"
          size={48}
          color={theme.colors.destructive}
          style={styles.errorIcon}
        />
        <Text
          style={[
            styles.errorText,
            { color: theme.colors.foregroundSecondary },
          ]}
        >
          加载失败
        </Text>
        <Text
          style={[
            styles.errorMessage,
            { color: theme.colors.foregroundTertiary },
          ]}
        >
          {memoService.detailError}
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => {
            if (id) {
              memoService.fetchMemoDetail(id);
            }
          }}
        >
          <Text style={styles.retryButtonText}>重新加载</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const memo = memoService.currentMemo;
  if (!memo) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          style={[
            styles.emptyText,
            { color: theme.colors.foregroundSecondary },
          ]}
        >
          未找到该备忘录
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.headerIconButton,
            { backgroundColor: theme.colors.muted },
          ]}
          onPress={handleBack}
        >
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            styles.headerIconButton,
            { backgroundColor: theme.colors.muted },
          ]}
          onPress={handleEdit}
        >
          <MaterialIcons
            name="edit"
            size={20}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.headerIconButton,
            { backgroundColor: theme.colors.muted, marginHorizontal: 8 },
          ]}
          onPress={handleCopy}
        >
          <MaterialIcons
            name="content-copy"
            size={20}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.headerIconButton,
            { backgroundColor: theme.colors.muted },
          ]}
          onPress={() => setMenuVisible(true)}
        >
          <MaterialIcons
            name="more-vert"
            size={20}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>
      </View>

      {/* 底部抽屉菜单 */}
      {menuVisible && (
        <Modal
          visible={menuVisible}
          transparent
          animationType="none"
          onRequestClose={() => setMenuVisible(false)}
        >
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
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setMenuVisible(false)}
            />
          </Animated.View>

          {/* 抽屉内容 */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                backgroundColor: theme.colors.background,
                paddingBottom: insets.bottom || 16,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* 操作区域 - 独立色块 */}
            <View
              style={[
                styles.actionSection,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={handleDelete}
              >
                <MaterialIcons
                  name="delete"
                  size={22}
                  color={theme.colors.destructive}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.destructive },
                  ]}
                >
                  删除
                </Text>
              </TouchableOpacity>
            </View>

            {/* 取消按钮 - 独立色块 */}
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: theme.colors.card },
              ]}
              onPress={() => setMenuVisible(false)}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: theme.colors.foreground },
                ]}
              >
                取消
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}

      {/* 删除确认对话框 */}
      {deleteConfirmVisible && (
        <Modal
          visible={deleteConfirmVisible}
          transparent
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <View style={styles.confirmOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={cancelDelete} />
            <View
              style={[
                styles.confirmDialog,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text
                style={[
                  styles.confirmTitle,
                  { color: theme.colors.foreground },
                ]}
              >
                确认删除
              </Text>
              <Text
                style={[
                  styles.confirmMessage,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                确定要删除这条备忘录吗？此操作无法撤销。
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: theme.colors.background },
                  ]}
                  onPress={cancelDelete}
                >
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: theme.colors.foreground },
                    ]}
                  >
                    取消
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    styles.confirmButtonDestructive,
                    { backgroundColor: theme.colors.destructive },
                  ]}
                  onPress={confirmDelete}
                >
                  <Text style={[styles.confirmButtonText, { color: "#fff" }]}>
                    删除
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 内容区域 */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handlePageScroll}
        scrollEventThrottle={120}
      >
        {/* 主卡片 */}
        <View
          style={[
            styles.mainCard,
            {
              backgroundColor: theme.colors.card,
              marginHorizontal: theme.spacing.md,
            },
          ]}
        >
          {/* 内容 */}
          <View style={styles.contentSection}>
            <Text
              style={[styles.contentText, { color: theme.colors.foreground }]}
            >
              {memo.content}
            </Text>
          </View>

          {/* 时间信息 */}
          <View
            style={[
              styles.timeSection,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <Text
              style={[
                styles.timeText,
                { color: theme.colors.foregroundTertiary },
              ]}
            >
              创建时间: {formatDate(memo.createdAt)}
            </Text>
            {memo.updatedAt !== memo.createdAt && (
              <Text
                style={[
                  styles.timeText,
                  { color: theme.colors.foregroundTertiary },
                ]}
              >
                编辑时间: {formatDate(memo.updatedAt)}
              </Text>
            )}
          </View>
        </View>

        {/* 附件部分 */}
        {memo.attachments && memo.attachments.length > 0 && (
          <View
            style={[
              styles.sectionContainer,
              {
                marginHorizontal: theme.spacing.md,
                marginTop: theme.spacing.lg,
              },
            ]}
          >
            <View
              style={[
                styles.sectionHeader,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <MaterialIcons
                name="attach-file"
                size={20}
                color={theme.colors.primary}
                style={styles.sectionIcon}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.foreground },
                ]}
              >
                附件 ({memo.attachments.length})
              </Text>
            </View>
            <View style={styles.attachmentsContent}>
              <AttachmentGrid
                attachments={memo.attachments}
                onAttachmentPress={handleAttachmentPress}
              />
            </View>
          </View>
        )}

        {/* 相关笔记部分 */}
        <View
          style={[
            styles.sectionContainer,
            { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.lg },
          ]}
        >
          <View
            style={[
              styles.sectionHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Sparkles
              size={20}
              color={theme.colors.relatedMemo}
              style={styles.sectionIcon}
            />
            <Text
              style={[styles.sectionTitle, { color: theme.colors.foreground }]}
            >
              语义相关
            </Text>
          </View>

          <View style={styles.relatedMemosContent}>
            <RelatedMemoList memoId={id} onMemoPress={handleRelatedMemoPress} />
          </View>
        </View>

        {/* 底部空白 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 图片查看器 */}
      <ImageViewer
        visible={imageViewerVisible}
        images={
          memo.attachments?.filter(
            (att) => getFileTypeFromMime(att.type) === "image",
          ) || []
        }
        initialIndex={selectedImageIndex}
        onClose={() => setImageViewerVisible(false)}
      />

      {/* 视频播放器 */}
      <VideoPlayer
        visible={videoPlayerVisible}
        video={selectedVideo}
        onClose={() => {
          setVideoPlayerVisible(false);
          setSelectedVideo(null);
        }}
      />
    </View>
  );
});

MemoDetailContent.displayName = "MemoDetailContent";

export default bindServices(MemoDetailContent, [
  MemoService,
  RelatedMemoService,
]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 56,
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 40,
  },
  // 底部抽屉样式
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
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 201,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  // 操作区域容器
  actionSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  // 操作按钮
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: "500",
  },
  // 取消按钮
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // 删除确认对话框样式
  confirmOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  confirmDialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDestructive: {
    // 删除按钮使用主题的 destructive 色
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  mainCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 12,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
  },
  timeSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  timeText: {
    fontSize: 12,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 13,
  },
  sectionContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  attachmentsContent: {
    marginBottom: 8,
  },
  relatedMemosContent: {
    gap: 8,
  },
  relatedMemoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  relatedMemoContent: {
    flex: 1,
    marginRight: 8,
  },
  relatedMemoText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  similarityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  similarityText: {
    fontSize: 11,
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
