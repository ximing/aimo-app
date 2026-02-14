/**
 * Image Viewer Component - 图片查看器组件
 * 支持查看大图、手势缩放、滑动切换多张图片
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { view } from '@rabjs/react';
import { useTheme } from '@/hooks/use-theme';
import type { AttachmentDto } from '@/types/memo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  images: AttachmentDto[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageViewer = view(({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageViewerProps) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 当 visible 变化时重置索引
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  if (!visible || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* 背景遮罩 */}
        <View style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]} />

        {/* 关闭按钮 */}
        <TouchableOpacity
          style={[styles.closeButton, { top: Platform.OS === 'ios' ? 50 : 20 }]}
          onPress={onClose}
        >
          <MaterialIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* 图片计数器 */}
        {images.length > 1 && (
          <View style={[styles.counter, { top: Platform.OS === 'ios' ? 50 : 20 }]}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        )}

        {/* 图片显示区域 */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImage.url }}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />
        </View>

        {/* 导航按钮 */}
        {images.length > 1 && (
          <>
            {/* 上一张 */}
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={handlePrevious}
              >
                <MaterialIcons name="chevron-left" size={40} color="#fff" />
              </TouchableOpacity>
            )}

            {/* 下一张 */}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNext}
              >
                <MaterialIcons name="chevron-right" size={40} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* 底部信息栏 */}
        <View style={[styles.infoBar, { bottom: Platform.OS === 'ios' ? 40 : 20 }]}>
          <Text style={styles.infoText} numberOfLines={1}>
            {currentImage.filename}
          </Text>
        </View>
      </View>
    </Modal>
  );
});

ImageViewer.displayName = 'ImageViewer';

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
  counter: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  infoBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
