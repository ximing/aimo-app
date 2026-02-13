/**
 * 媒体选择 Hook
 * 处理图片和视频的选择、拍照等功能
 * 需要: expo-image-picker
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

export interface SelectedMedia {
  type: 'image' | 'video';
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export function useMediaPicker() {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 请求权限
  const requestPermissions = useCallback(async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraStatus === 'granted' || mediaLibraryStatus === 'granted';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '权限请求失败';
      setError(errorMsg);
      return false;
    }
  }, []);

  // 拍照
  const takePicture = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('需要相机权限');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.cancelled) {
        const asset = result.assets[0];
        const media: SelectedMedia = {
          type: 'image',
          uri: asset.uri,
          name: `photo-${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        };
        setSelectedMedia(prev => [...prev, media]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '拍照失败';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [requestPermissions]);

  // 从相册选择图片
  const pickImage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('需要媒体库权限');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultiple: true,
      });

      if (!result.cancelled) {
        const newMedia = result.assets.map(asset => ({
          type: 'image' as const,
          uri: asset.uri,
          name: `image-${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        }));
        setSelectedMedia(prev => [...prev, ...newMedia]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '选择图片失败';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [requestPermissions]);

  // 从相册选择视频
  const pickVideo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('需要媒体库权限');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.cancelled) {
        const asset = result.assets[0];
        const media: SelectedMedia = {
          type: 'video',
          uri: asset.uri,
          name: `video-${Date.now()}.mp4`,
          mimeType: 'video/mp4',
        };
        setSelectedMedia(prev => [...prev, media]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '选择视频失败';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [requestPermissions]);

  // 移除某个媒体
  const removeMedia = useCallback((index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 清空所有媒体
  const clearMedia = useCallback(() => {
    setSelectedMedia([]);
  }, []);

  // 清空错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    selectedMedia,
    loading,
    error,
    takePicture,
    pickImage,
    pickVideo,
    removeMedia,
    clearMedia,
    clearError,
  };
}
