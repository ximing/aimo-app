/**
 * Media Preview Component - 媒体预览组件
 * 显示已选择的图片和视频
 */

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { view } from '@rabjs/react';
import { useTheme } from '@/hooks/use-theme';
import type { SelectedMedia } from '@/hooks/use-media-picker';

interface MediaPreviewProps {
  media: SelectedMedia[];
  onRemove?: (index: number) => void;
}

export const MediaPreview = view(({
  media,
  onRemove,
}: MediaPreviewProps) => {
  const theme = useTheme();

  if (media.length === 0) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.colors.backgroundSecondary,
        borderBottomColor: theme.colors.border,
      }
    ]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {media.map((item, index) => (
          <View key={index} style={styles.mediaItem}>
            {item.type === 'image' ? (
              <Image
                source={{ uri: item.uri }}
                style={styles.media}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.media, { backgroundColor: theme.colors.card }]}>
                <MaterialIcons name="videocam" size={32} color={theme.colors.warning} />
              </View>
            )}
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.colors.destructive }]}
              onPress={() => onRemove?.(index)}
            >
              <MaterialIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

MediaPreview.displayName = 'MediaPreview';

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  mediaItem: {
    position: 'relative',
  },
  media: {
    width: 100,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
