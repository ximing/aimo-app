/**
 * 音频录制 Hook
 * 处理语音录制功能，管理录音状态和权限
 * 需要: expo-av
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio, AudioMode } from 'expo-av';

export interface AudioRecorderState {
  /** 是否正在录音 */
  recording: boolean;
  /** 录音文件的 URI */
  uri: string | null;
  /** 录音时长（毫秒） */
  duration: number;
  /** 错误信息 */
  error: string | null;
}

export interface AudioRecorderActions {
  /** 开始录音 */
  startRecording: () => Promise<void>;
  /** 停止录音 */
  stopRecording: () => Promise<string | null>;
  /** 重置录音状态 */
  reset: () => void;
  /** 清除错误 */
  clearError: () => void;
}

export type UseAudioRecorderReturn = AudioRecorderState & AudioRecorderActions;

/**
 * 音频录制 Hook
 * @returns 录音状态和控制方法
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recording, setRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recordingInstanceRef = useRef<Audio.Recording | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // 清理函数
  const cleanup = useCallback(async () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (recordingInstanceRef.current) {
      try {
        await recordingInstanceRef.current.stopAndUnloadAsync();
      } catch {
        // 忽略停止错误
      }
      recordingInstanceRef.current = null;
    }
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 请求麦克风权限
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '权限请求失败';
      setError(errorMsg);
      return false;
    }
  }, []);

  // 配置音频模式
  const configureAudioMode = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '音频模式配置失败';
      setError(errorMsg);
    }
  }, []);

  // 开始录音
  const startRecording = useCallback(async () => {
    setError(null);
    setUri(null);
    setDuration(0);

    try {
      // 请求权限
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('需要麦克风权限才能录音');
        return;
      }

      // 配置音频模式
      await configureAudioMode();

      // 创建录音实例
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingInstanceRef.current = newRecording;
      startTimeRef.current = Date.now();
      setRecording(true);

      // 启动计时器更新录音时长
      durationTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);
      }, 100);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '开始录音失败';
      setError(errorMsg);
      setRecording(false);
    }
  }, [requestPermissions, configureAudioMode]);

  // 停止录音
  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!recordingInstanceRef.current) {
      return null;
    }

    try {
      // 停止计时器
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }

      // 停止录音
      await recordingInstanceRef.current.stopAndUnloadAsync();

      // 获取录音文件 URI
      const recordingUri = recordingInstanceRef.current.getURI();
      recordingInstanceRef.current = null;

      if (recordingUri) {
        setUri(recordingUri);
      }

      setRecording(false);
      return recordingUri;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '停止录音失败';
      setError(errorMsg);
      setRecording(false);
      return null;
    }
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    cleanup();
    setRecording(false);
    setUri(null);
    setDuration(0);
    setError(null);
  }, [cleanup]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recording,
    uri,
    duration,
    error,
    startRecording,
    stopRecording,
    reset,
    clearError,
  };
}
