/**
 * Media Picker Component - 媒体选择器
 * 提供拍照、选择图片/视频的界面
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { view } from '@rabjs/react';
import { useTheme } from '@/hooks/use-theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SelectedMedia } from '@/hooks/use-media-picker';

interface MediaPickerProps {
  onTakePicture?: () => Promise<void>;
  onPickImage?: () => Promise<void>;
  onPickVideo?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const MediaPicker = view(({
  onTakePicture,
  onPickImage,
  onPickVideo,
  loading = false,
  error,
}: MediaPickerProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = async (action?: () => Promise<void>) => {
    if (action && !loading) {
      await action();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.pickerBar,
        {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, theme.spacing.md),
        }
      ]}>
        {/* 拍照按钮 */}
        <TouchableOpacity
          style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
          onPress={() => handlePress(onTakePicture)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <MaterialIcons name="camera-alt" size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>

        {/* 选择图片按钮 */}
        <TouchableOpacity
          style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
          onPress={() => handlePress(onPickImage)}
          disabled={loading}
        >
          <MaterialIcons name="image" size={24} color={theme.colors.info} />
        </TouchableOpacity>

        {/* 选择视频按钮 */}
        <TouchableOpacity
          style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
          onPress={() => handlePress(onPickVideo)}
          disabled={loading}
        >
          <MaterialIcons name="videocam" size={24} color={theme.colors.warning} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

MediaPicker.displayName = 'MediaPicker';

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  pickerBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
  },
});
