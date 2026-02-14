/**
 * Video Player Component - 视频播放器组件
 * 使用 expo-av 播放视频
 */

import React, { useState, useRef, useEffect } from 'react';
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
import { view } from '@rabjs/react';
import { useTheme } from '@/hooks/use-theme';
import type { AttachmentDto } from '@/types/memo';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

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
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // 当 visible 变化时重置状态
  useEffect(() => {
    if (visible) {
      setIsPlaying(true);
      setIsLoading(true);
      setPosition(0);
    } else {
      setIsPlaying(false);
    }
  }, [visible]);

  // 清理：关闭时停止播放
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.stopAsync();
      }
    };
  }, []);

  if (!visible || !video) {
    return null;
  }

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);

      // 视频播放结束
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleClose = async () => {
    if (videoRef.current) {
      await videoRef.current.stopAsync();
    }
    onClose();
  };

  // 格式化时间（毫秒转 mm:ss）
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
          <Video
            ref={videoRef}
            source={{ uri: video.url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={true}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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
                {formatTime(position)} / {formatTime(duration)}
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
