/**
 * 音频播放 Hook
 * 处理音频附件的播放功能
 * 需要: expo-audio
 */

import { createAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAudioPlaybackReturn {
  /** 当前正在播放的附件 ID */
  playingAttachmentId: string | null;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 播放指定音频 */
  play: (attachmentId: string, url: string) => void;
  /** 停止当前音频 */
  stop: () => void;
}

/**
 * 音频播放 Hook
 * @returns 播放状态和控制方法
 */
export function useAudioPlayback(): UseAudioPlaybackReturn {
  const [playingAttachmentId, setPlayingAttachmentId] = useState<string | null>(null);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  // 清理函数
  const cleanupPlayer = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.remove();
      playerRef.current = null;
    }
    currentUrlRef.current = null;
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupPlayer();
    };
  }, [cleanupPlayer]);

  // 监听播放器状态变化
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const checkPlaybackEnded = () => {
      // 检查是否播放结束 (currentTime >= duration)
      if (!player.playing && player.duration > 0 && player.currentTime >= player.duration - 0.1) {
        cleanupPlayer();
        setPlayingAttachmentId(null);
      }
    };

    const interval = setInterval(checkPlaybackEnded, 200);
    return () => clearInterval(interval);
  }, [cleanupPlayer]);

  const play = useCallback((attachmentId: string, url: string) => {
    // 如果正在播放同一个音频，停止
    if (playingAttachmentId === attachmentId && playerRef.current) {
      cleanupPlayer();
      setPlayingAttachmentId(null);
      return;
    }

    // 停止当前播放
    if (playerRef.current) {
      cleanupPlayer();
    }

    // 创建新播放器
    const player = createAudioPlayer(url);
    playerRef.current = player;
    currentUrlRef.current = url;
    setPlayingAttachmentId(attachmentId);

    // 播放
    player.play();
  }, [cleanupPlayer, playingAttachmentId]);

  const stop = useCallback(() => {
    cleanupPlayer();
    setPlayingAttachmentId(null);
  }, [cleanupPlayer]);

  return {
    playingAttachmentId,
    isPlaying: playerRef.current?.playing ?? false,
    play,
    stop,
  };
}
