/**
 * Memo Item Component - 备忘录列表项
 * 使用 @rabjs/react 的 view 装饰器以响应响应式数据变化（包括主题）
 * 同时保持性能优化
 */

import { AttachmentGrid, CategoryPickerModal, ImageViewer, VideoPlayer } from "@/components/memos";
import { useTheme } from "@/hooks/use-theme";
import CategoryService from "@/services/category-service";
import MemoService from "@/services/memo-service";
import type { AttachmentDto, Memo } from "@/types/memo";
import type { TagDto } from "@/types/tag";
import { getFileTypeFromMime } from "@/utils/attachment";
import { showError, showSuccess } from "@/utils/toast";
import { MaterialIcons } from "@expo/vector-icons";
import { useService, view } from "@rabjs/react";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Clipboard,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 启用 LayoutAnimation (Android 需要特殊处理)
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MemoItemProps {
  memo: Memo;
  onPress?: (memoId: string) => void;
}

const MemoItemComponent = view(({ memo, onPress }: MemoItemProps) => {
  const theme = useTheme();
  const router = useRouter();
  const memoService = useService(MemoService);
  const categoryService = useService(CategoryService);
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<AttachmentDto | null>(
    null,
  );
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const { playingAttachmentId, play: playAudio } = useAudioPlayback();

  // 动画值
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // 触发动画
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

  // 格式化时间显示
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    // 负数或当天显示"刚刚"
    if (diffDays <= 0) {
      if (diffMinutes < 1) {
        return "刚刚";
      } else if (diffMinutes < 60) {
        return `${diffMinutes} 分钟前`;
      } else {
        // 当天但超过1小时，显示具体时间
        return date.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString("zh-CN");
    }
  };

  // 处理展开/收起动画
  const toggleExpanded = (e: any) => {
    e.stopPropagation?.();

    // 使用 LayoutAnimation 实现平滑过渡
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );

    setIsExpanded(!isExpanded);
  };

  // 计算是否需要截断（超过150个字符）
  const getContentDisplay = () => {
    const contentLength = memo.content.length;
    const shouldTruncate = contentLength > 150;

    if (isExpanded) {
      return {
        text: memo.content,
        shouldTruncate,
      };
    }

    if (shouldTruncate) {
      // 截断到150个字符
      const truncatedContent = memo.content.substring(0, 150);
      return {
        text: truncatedContent,
        shouldTruncate: true,
      };
    }

    return {
      text: memo.content,
      shouldTruncate: false,
    };
  };

  const contentDisplay = getContentDisplay();
  const sourceUrl = memo.source?.trim() ?? "";

  const openSourceUrl = async () => {
    try {
      await Linking.openURL(sourceUrl);
    } catch (error) {
      console.error("打开来源链接失败:", error);
      showError("打开来源链接失败");
    }
  };

  const handleSourcePress = (e: any) => {
    e.stopPropagation?.();
    void openSourceUrl();
  };

  // 处理更多按钮点击
  const handleMorePress = (e: any) => {
    e.stopPropagation?.();
    setMenuVisible(true);
  };

  // 处理编辑
  const handleEdit = () => {
    setMenuVisible(false);
    // 导航到编辑页面
    router.push(`/(memos)/create?memoId=${memo.memoId}`);
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
      await memoService.deleteMemo(memo.memoId);
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  // 取消删除
  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
  };

  // 处理复制
  const handleCopy = () => {
    setMenuVisible(false);
    Clipboard.setString(memo.content);
    showSuccess("已复制到剪贴板");
  };

  // 处理公开/私密状态切换
  const handleToggleVisibility = async () => {
    setMenuVisible(false);
    try {
      const newVisibility = !memo.isPublic;
      await memoService.updateMemoVisibility(memo.memoId, newVisibility);
      showSuccess(newVisibility ? "已设为公共" : "已设为私密");
    } catch (error) {
      console.error("更新公开状态失败:", error);
      showError("更新公开状态失败");
    }
  };

  // 处理修改分类
  const handleChangeCategory = () => {
    setMenuVisible(false);
    setCategoryPickerVisible(true);
  };

  // 处理分类选择
  const handleSelectCategory = async (categoryId: string | null) => {
    try {
      await memoService.updateMemoCategory(memo.memoId, categoryId);
      showSuccess(categoryId ? "分类已更新" : "已移除分类");
    } catch (error) {
      console.error("更新分类失败:", error);
      showError("更新分类失败");
    }
  };

  // 格式化完整时间
  const formatFullDate = (timestamp: number): string => {
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
  const handleAttachmentPress = async (attachment: AttachmentDto) => {
    const fileType = getFileTypeFromMime(attachment.type);

    if (fileType === "image") {
      // 图片：打开图片查看器
      const imageAttachments =
        memo.attachments?.filter(
          (att) => getFileTypeFromMime(att.type) === "image",
        ) || [];
      const imageIndex = imageAttachments.findIndex(
        (att) => att.attachmentId === attachment.attachmentId,
      );
      setSelectedImageIndex(imageIndex >= 0 ? imageIndex : 0);
      setImageViewerVisible(true);
    } else if (fileType === "video") {
      // 视频：打开视频播放器
      setSelectedVideo(attachment);
      setVideoPlayerVisible(true);
    } else if (attachment.type.startsWith("audio/")) {
      // 音频：使用 playAudio 播放或停止
      try {
        playAudio(attachment.attachmentId, attachment.url);
      } catch (error) {
        console.error("播放音频失败:", error);
        showError("播放音频失败");
      }
    } else {
      // 其他文件类型：直接下载
      Linking.openURL(attachment.url).catch((err) =>
        console.error("下载附件失败:", err),
      );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          marginHorizontal: theme.spacing.md,
          marginVertical: theme.spacing.xs / 2,
        },
      ]}
      onPress={() => onPress?.(memo.memoId)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        {/* 卡片头部 - 标签 + 内容部分 */}
        <View style={styles.cardHeader}>
          {/* 标签展示 - 在内容上方 */}
          {memo.tags && memo.tags.length > 0 && (
            <View style={styles.tagsContainerHeader}>
              {memo.tags.slice(0, 3).map((tag: TagDto) => (
                <View
                  key={tag.tagId}
                  style={[
                    styles.tagChip,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: theme.colors.primary }]}
                    numberOfLines={1}
                  >
                    {tag.name}
                  </Text>
                </View>
              ))}
              {memo.tags.length > 3 && (
                <Text
                  style={[
                    styles.tagMore,
                    { color: theme.colors.foregroundTertiary },
                  ]}
                >
                  +{memo.tags.length - 3}
                </Text>
              )}
            </View>
          )}
          <View style={styles.cardTitleContent}>
            <View style={styles.contentWrapper}>
              <Text style={[styles.text, { color: theme.colors.foreground }]}>
                {contentDisplay.text}
                {!isExpanded && contentDisplay.shouldTruncate && (
                  <>
                    <Text
                      style={[
                        styles.expandText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      ...
                    </Text>
                    <Text
                      onPress={toggleExpanded}
                      style={[
                        styles.expandText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      展开
                    </Text>
                  </>
                )}
              </Text>
              {isExpanded && contentDisplay.shouldTruncate && (
                <TouchableOpacity
                  onPress={toggleExpanded}
                  activeOpacity={0.7}
                  style={styles.collapseButton}
                >
                  <Text
                    style={[styles.expandText, { color: theme.colors.primary }]}
                  >
                    收起
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* 附件展示 - 在内容和关联备忘录之间 */}
        {memo.attachments && memo.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <AttachmentGrid
              attachments={memo.attachments}
              onAttachmentPress={handleAttachmentPress}
              playingAttachmentId={playingAttachmentId}
            />
          </View>
        )}

        {/* 关联Memo列表 - 在内容和页脚之间 */}
        {memo.relations && memo.relations.length > 0 && (
          <View style={styles.relatedMemosContainer}>
            {memo.relations.slice(0, 5).map((relatedMemo) => (
              <TouchableOpacity
                key={relatedMemo.memoId}
                style={styles.relatedMemoItem}
                onPress={() => onPress?.(relatedMemo.memoId)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="link"
                  size={16}
                  color={theme.colors.relatedMemo}
                  style={styles.relatedMemoIcon}
                />
                <Text
                  style={[
                    styles.relatedMemoText,
                    { color: theme.colors.foregroundQuaternary },
                  ]}
                  numberOfLines={1}
                >
                  {relatedMemo.content.substring(0, 50)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 卡片页脚 - 时间、分类、公开状态和更多按钮 */}
        <View style={styles.cardFooter}>
          <View style={styles.metaInfo}>
            <View style={styles.leftMeta}>
              <Text
                style={[
                  styles.date,
                  { color: theme.colors.foregroundTertiary },
                ]}
              >
                {formatDate(memo.updatedAt)}
              </Text>
              {/* 分类显示 */}
              {memo.categoryId && (
                <View
                  style={[
                    styles.categoryContainer,
                    {
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? "rgba(59, 130, 246, 0.2)"
                          : "rgba(59, 130, 246, 0.15)",
                    },
                  ]}
                >
                  <MaterialIcons
                    name="folder-open"
                    size={12}
                    color={
                      theme.colorScheme === "dark"
                        ? "rgb(147, 197, 253)"
                        : "rgb(59, 130, 246)"
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color:
                          theme.colorScheme === "dark"
                            ? "rgb(147, 197, 253)"
                            : "rgb(59, 130, 246)",
                      },
                    ]}
                  >
                    {categoryService.categories.find(
                      (c) => c.categoryId === memo.categoryId,
                    )?.name || memo.categoryId}
                  </Text>
                </View>
              )}
              {/* 公开状态显示 */}
              <MaterialIcons
                name={memo.isPublic ? "public" : "lock"}
                size={12}
                color={
                  memo.isPublic
                    ? theme.colors.success
                    : theme.colors.foregroundTertiary
                }
              />
              {memo.source && (
                <TouchableOpacity
                  style={styles.sourceIconButton}
                  onPress={handleSourcePress}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <MaterialIcons
                    name="open-in-new"
                    size={13}
                    color={theme.colors.info}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* 右侧菜单按钮 */}
            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleMorePress}
            >
              <MaterialIcons
                name="more-horiz"
                size={20}
                color={theme.colors.foregroundSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
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
            {/* 时间信息区域 - 独立色块 */}
            <View
              style={[
                styles.timeInfoSection,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text
                style={[
                  styles.timeInfoText,
                  { color: theme.colors.foregroundSecondary },
                ]}
              >
                创建于 {formatFullDate(memo.createdAt)}
              </Text>
              {memo.updatedAt !== memo.createdAt && (
                <Text
                  style={[
                    styles.timeInfoText,
                    { color: theme.colors.foregroundSecondary },
                  ]}
                >
                  最后编辑于 {formatFullDate(memo.updatedAt)}
                </Text>
              )}
            </View>

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
                onPress={handleEdit}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color={theme.colors.foreground}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.foreground },
                  ]}
                >
                  编辑
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={handleCopy}
              >
                <MaterialIcons
                  name="content-copy"
                  size={22}
                  color={theme.colors.foreground}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.foreground },
                  ]}
                >
                  复制
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={handleChangeCategory}
              >
                <MaterialIcons
                  name="folder"
                  size={22}
                  color={theme.colors.foreground}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.foreground },
                  ]}
                >
                  修改分类
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={handleToggleVisibility}
              >
                <MaterialIcons
                  name={memo.isPublic ? "lock" : "public"}
                  size={22}
                  color={theme.colors.foreground}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.foreground },
                  ]}
                >
                  {memo.isPublic ? "设为私密" : "设为公共"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
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

      {/* 分类选择弹窗 */}
      <CategoryPickerModal
        visible={categoryPickerVisible}
        categories={categoryService.categories}
        selectedCategoryId={memo.categoryId || null}
        onSelect={handleSelectCategory}
        onClose={() => setCategoryPickerVisible(false)}
      />
    </TouchableOpacity>
  );
});

// 导出使用 view 包装的组件
// view 会自动跟踪组件中使用的响应式数据（包括 useTheme）
// 当这些数据变化时，组件会自动重新渲染
export const MemoItem = MemoItemComponent;

MemoItem.displayName = "MemoItem";

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 4,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: "column",
    marginBottom: 2,
  },
  cardTitleContent: {
    flex: 1,
  },
  moreButton: {
    padding: 4,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
  contentWrapper: {
    flex: 1,
  },
  expandText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  collapseButton: {
    marginTop: 6,
  },
  cardFooter: {
    paddingTop: 2,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
    gap: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  tagMore: {
    fontSize: 11,
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
  },
  sourceIconButton: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 11,
  },
  tagsContainerHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  attachmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  attachmentCount: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
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
  // 时间信息区域（抽屉顶部）
  timeInfoSection: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  timeInfoText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  // 操作区域容器
  actionSection: {
    marginHorizontal: 16,
    marginTop: 12,
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
  // 附件容器样式
  attachmentsContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  // 关联Memo样式
  relatedMemosContainer: {
    marginTop: 2,
    gap: 2,
  },
  relatedMemoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 0,
    gap: 6,
  },
  relatedMemoIcon: {
    flexShrink: 0,
  },
  relatedMemoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
