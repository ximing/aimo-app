/**
 * Attachment Grid Component - 附件网格展示组件
 * 在备忘录卡片中展示附件，支持图片、视频、音频和文件类型
 * 音频附件使用类似微信录音的横向条形样式展示
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
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
  /** 当前正在播放的音频附件 ID */
  playingAttachmentId?: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 计算每个附件项的宽度：屏幕宽度减去卡片左右边距和内边距，再除以4
const ATTACHMENT_SIZE = (SCREEN_WIDTH - 32 - 28 - 12) / 4; // 32: 卡片左右边距, 28: 卡片内边距, 12: 间距
const MIN_AUDIO_WIDTH = 80; // 最小音频条宽度
const MAX_AUDIO_WIDTH = SCREEN_WIDTH - 64 - 16; // 最大音频条宽度（减去左右边距和内边距）
const AUDIO_HEIGHT = 36; // 音频条高度

// 计算音频条的宽度
const calculateAudioWidth = (attachment: AttachmentDto): number => {
  // 优先使用 duration
  const duration = attachment.properties?.duration;
  if (typeof duration === 'number' && duration > 0) {
    // 每秒对应约 4px 宽度，上限 60 秒
    const width = Math.min(duration * 4, 60 * 4);
    return Math.max(width, MIN_AUDIO_WIDTH);
  }

  // 其次使用 size
  if (attachment.size > 0) {
    // 每 10KB 对应约 1px 宽度
    const width = Math.ceil(attachment.size / 10240) * 4;
    return Math.min(Math.max(width, MIN_AUDIO_WIDTH), MAX_AUDIO_WIDTH);
  }

  // 默认长度
  return 120;
};

// 格式化音频时长
const formatAudioDuration = (attachment: AttachmentDto): string => {
  const duration = attachment.properties?.duration;
  if (typeof duration === 'number' && duration > 0) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return '';
};

// 判断是否为音频类型
const isAudioType = (type: string): boolean => {
  return type.startsWith('audio/');
};

export const AttachmentGrid = view(({
  attachments,
  onAttachmentPress,
  playingAttachmentId,
}: AttachmentGridProps) => {
  const theme = useTheme();

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // 分离音频附件和其他附件
  const audioAttachments = attachments.filter((a) => isAudioType(a.type));
  const otherAttachments = attachments.filter((a) => !isAudioType(a.type));

  // 最多显示8个其他附件（2行 × 4列）
  const displayOtherAttachments = otherAttachments.slice(0, 8);

  // 渲染音频附件（类似微信录音样式）
  const renderAudioAttachment = (attachment: AttachmentDto) => {
    const audioWidth = calculateAudioWidth(attachment);
    const duration = formatAudioDuration(attachment);
    const isPlaying = playingAttachmentId === attachment.attachmentId;

    // 创建波形动画
    const wave1Anim = useRef(new Animated.Value(8)).current;
    const wave2Anim = useRef(new Animated.Value(12)).current;
    const wave3Anim = useRef(new Animated.Value(16)).current;
    const wave4Anim = useRef(new Animated.Value(12)).current;
    const wave5Anim = useRef(new Animated.Value(8)).current;

    useEffect(() => {
      if (isPlaying) {
        let isCancelled = false;

        const animateWave = () => {
          if (isCancelled) return;

          const duration = 300;
          Animated.parallel([
            Animated.sequence([
              Animated.timing(wave1Anim, { toValue: 16, duration, useNativeDriver: false }),
              Animated.timing(wave1Anim, { toValue: 8, duration, useNativeDriver: false }),
            ]),
            Animated.sequence([
              Animated.timing(wave2Anim, { toValue: 8, duration, useNativeDriver: false }),
              Animated.timing(wave2Anim, { toValue: 16, duration, useNativeDriver: false }),
            ]),
            Animated.sequence([
              Animated.timing(wave3Anim, { toValue: 12, duration, useNativeDriver: false }),
              Animated.timing(wave3Anim, { toValue: 20, duration, useNativeDriver: false }),
            ]),
            Animated.sequence([
              Animated.timing(wave4Anim, { toValue: 16, duration, useNativeDriver: false }),
              Animated.timing(wave4Anim, { toValue: 8, duration, useNativeDriver: false }),
            ]),
            Animated.sequence([
              Animated.timing(wave5Anim, { toValue: 12, duration, useNativeDriver: false }),
              Animated.timing(wave5Anim, { toValue: 8, duration, useNativeDriver: false }),
            ]),
          ]).start((finished) => {
            if (!isCancelled && finished) {
              animateWave();
            }
          });
        };
        animateWave();

        // 清理函数：停止动画
        return () => {
          isCancelled = true;
          wave1Anim.stopAnimation();
          wave2Anim.stopAnimation();
          wave3Anim.stopAnimation();
          wave4Anim.stopAnimation();
          wave5Anim.stopAnimation();
          // 重置为默认值
          wave1Anim.setValue(8);
          wave2Anim.setValue(12);
          wave3Anim.setValue(16);
          wave4Anim.setValue(12);
          wave5Anim.setValue(8);
        };
      } else {
        // 停止动画并重置
        wave1Anim.stopAnimation();
        wave2Anim.stopAnimation();
        wave3Anim.stopAnimation();
        wave4Anim.stopAnimation();
        wave5Anim.stopAnimation();
        wave1Anim.setValue(8);
        wave2Anim.setValue(12);
        wave3Anim.setValue(16);
        wave4Anim.setValue(12);
        wave5Anim.setValue(8);
      }
    }, [isPlaying, playingAttachmentId]);

    return (
      <TouchableOpacity
        key={attachment.attachmentId}
        style={[
          styles.audioContainer,
          {
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          { width: audioWidth },
        ]}
        onPress={() => onAttachmentPress?.(attachment)}
        activeOpacity={0.7}
      >
        {/* 小尖角 - 上边框偏左 */}
        <View style={[styles.audioArrow, { borderBottomColor: theme.colors.card }]} />
        <View style={[styles.audioArrowBorder, { borderBottomColor: theme.colors.border }]} />

        <View style={styles.audioContent}>
          <View style={styles.audioWavePlaceholder}>
            {/* 使用多个小竖条模拟波形 */}
            <Animated.View
              style={[
                styles.waveBar,
                { backgroundColor: theme.colors.primary, height: wave1Anim },
              ]}
            />
            <Animated.View
              style={[
                styles.waveBar,
                { backgroundColor: theme.colors.primary, height: wave2Anim },
              ]}
            />
            <Animated.View
              style={[
                styles.waveBar,
                { backgroundColor: theme.colors.primary, height: wave3Anim },
              ]}
            />
            <Animated.View
              style={[
                styles.waveBar,
                { backgroundColor: theme.colors.primary, height: wave4Anim },
              ]}
            />
            <Animated.View
              style={[
                styles.waveBar,
                { backgroundColor: theme.colors.primary, height: wave5Anim },
              ]}
            />
          </View>
          {duration && (
            <Text
              style={[
                styles.audioDuration,
                { color: theme.colors.foregroundSecondary },
              ]}
            >
              {duration}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderOtherAttachment = (attachment: AttachmentDto) => {
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
      {/* 音频附件 - 纵向列表展示 */}
      {audioAttachments.length > 0 && (
        <View style={styles.audioList}>
          {audioAttachments.map(renderAudioAttachment)}
        </View>
      )}

      {/* 其他附件 - 网格展示 */}
      {displayOtherAttachments.length > 0 && (
        <View style={styles.grid}>
          {displayOtherAttachments.map(renderOtherAttachment)}
        </View>
      )}
    </View>
  );
});

AttachmentGrid.displayName = 'AttachmentGrid';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  // 音频列表样式
  audioList: {
    width: '100%',
    gap: 6,
    marginBottom: 6,
  },
  audioContainer: {
    height: AUDIO_HEIGHT,
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  // 小尖角 - 内部箭头（指向上方，上边框偏左）
  audioArrow: {
    position: 'absolute',
    top: -5,
    left: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // 小尖角边框 - 外部边框
  audioArrowBorder: {
    position: 'absolute',
    top: -7,
    left: 11,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  audioContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  audioWavePlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginHorizontal: 8,
  },
  waveBar: {
    width: 2,
    minHeight: 8,
    borderRadius: 1,
  },
  audioDuration: {
    fontSize: 11,
    fontWeight: '500',
  },
  // 网格样式
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
