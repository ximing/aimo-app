/**
 * Attachment Grid Component - 附件网格展示组件
 * 在备忘录卡片中展示附件，支持图片、视频和文件类型
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { view } from '@rabjs/react';
import { useTheme } from '@/hooks/use-theme';
import type { AttachmentDto } from '@/types/memo';
import { getFileTypeFromMime, getFileIcon, formatFileName } from '@/utils/attachment';

interface AttachmentGridProps {
  attachments: AttachmentDto[];
  onAttachmentPress?: (attachment: AttachmentDto) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 计算每个附件项的宽度：屏幕宽度减去卡片左右边距和内边距，再除以4
const ATTACHMENT_SIZE = (SCREEN_WIDTH - 32 - 28 - 12) / 4; // 32: 卡片左右边距, 28: 卡片内边距, 12: 间距

export const AttachmentGrid = view(({
  attachments,
  onAttachmentPress,
}: AttachmentGridProps) => {
  const theme = useTheme();

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // 最多显示8个附件（2行 × 4列）
  const displayAttachments = attachments.slice(0, 8);

  const renderAttachment = (attachment: AttachmentDto) => {
    const fileType = getFileTypeFromMime(attachment.type);
    const isImageType = fileType === 'image';
    const isVideoType = fileType === 'video';

    return (
      <TouchableOpacity
        key={attachment.attachmentId}
        style={styles.attachmentItem}
        onPress={() => onAttachmentPress?.(attachment)}
        activeOpacity={0.7}
      >
        {isImageType ? (
          // 图片类型 - 显示缩略图
          <Image
            source={{ uri: attachment.url }}
            style={[
              styles.attachmentImage,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            contentFit="cover"
            placeholder={
              theme.isDark
                ? require('@/assets/logo-dark.png')
                : require('@/assets/logo.png')
            }
            transition={200}
          />
        ) : isVideoType ? (
          // 视频类型 - 显示占位符和播放图标
          <View
            style={[
              styles.attachmentImage,
              styles.videoPlaceholder,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <MaterialIcons
              name="play-circle-filled"
              size={32}
              color={theme.colors.primary}
            />
          </View>
        ) : (
          // 其他文件类型 - 显示文件图标和文件名
          <View
            style={[
              styles.attachmentFile,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <MaterialIcons
              name={getFileIcon(attachment.type) as any}
              size={28}
              color={theme.colors.foregroundSecondary}
            />
            <Text
              style={[
                styles.fileName,
                { color: theme.colors.foregroundSecondary },
              ]}
              numberOfLines={2}
            >
              {formatFileName(attachment.filename, 15)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {displayAttachments.map(renderAttachment)}
      </View>
    </View>
  );
});

AttachmentGrid.displayName = 'AttachmentGrid';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  attachmentItem: {
    width: ATTACHMENT_SIZE,
    height: ATTACHMENT_SIZE,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentFile: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  fileName: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 12,
  },
});
