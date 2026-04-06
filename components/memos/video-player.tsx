/**
 * Video Player Component - 视频播放器组件
 * 使用 expo-video 播放视频
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { view } from '@rabjs/react';
import { useTheme } from '@/hooks/use-theme';
import type { AttachmentDto } from '@/types/memo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
  visible: boolean;
  video: AttachmentDto | null;
  onClose: () => void;
}

export const VideoPlayer = view(({
  visible,
  video,
  onClose,
}: VideoPlayerProps) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const player = useVideoPlayer(video?.url ?? '', (player) => {
    player.loop = false;
    player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  // 当 visible 变化时重置状态
  useEffect(() => {
    if (visible) {
      setIsLoading(true);
    }
  }, [visible]);

  // 监听播放器状态
  useEffect(() => {
    if (status === 'readyToPlay' || status === 'loading') {
      setIsLoading(status === 'loading');
    }
    if (status === 'readyToPlay') {
      setIsLoading(false);
    }
  }, [status]);

  // 清理：关闭时停止播放
  useEffect(() => {
    return () => {
      if (player) {
        player.pause();
      }
    };
  }, [player]);

  if (!visible || !video) {
    return null;
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleClose = () => {
    player.pause();
    onClose();
  };

  // 格式化时间（秒转 mm:ss）
  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = player.currentTime ?? 0;
  const duration = player.duration ?? 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* 背景遮罩 */}
        <View style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]} />

        {/* 关闭按钮 */}
        <TouchableOpacity
          style={[styles.closeButton, { top: Platform.OS === 'ios' ? 50 : 20 }]}
          onPress={handleClose}
        >
          <MaterialIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* 视频播放器 */}
        <View style={styles.videoContainer}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            allowsPictureInPicture
          />

          {/* 加载指示器 */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {/* 播放/暂停按钮 */}
          {!isLoading && (
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
            >
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={60}
                color="rgba(255, 255, 255, 0.9)"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 底部控制栏 */}
        <View style={[styles.controlBar, { bottom: Platform.OS === 'ios' ? 40 : 20 }]}>
          <Text style={styles.filename} numberOfLines={1}>
            {video.filename}
          </Text>
          {duration > 0 && (
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  filename: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
});
