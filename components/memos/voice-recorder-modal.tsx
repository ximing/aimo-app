/**
 * Voice Recorder Modal Component - 录音浮层组件
 * 显示录音中状态，包含录音按钮、时长显示、取消按钮
 * 使用 @rabjs/react 的 view 装饰器以响应主题变化
 */

import { useAudioRecorder, formatDuration } from "@/hooks/use-audio-recorder";
import { useTheme } from "@/hooks/use-theme";
import { view } from "@rabjs/react";
import { Mic, Square, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface VoiceRecorderModalProps {
  /** 是否显示 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 录音完成回调，返回音频文件 URI */
  onRecordingComplete: (uri: string) => void;
}

/**
 * 录音中红点脉冲动画组件
 */
const RecordingIndicator = view(({ theme }: { theme: ReturnType<typeof useTheme> }) => {
  const [scale] = useState(new Animated.Value(1));
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.recordingIndicator,
        {
          backgroundColor: theme.colors.destructive,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
});

/**
 * 录音波形动画组件
 */
const WaveformAnimation = view(({ theme }: { theme: ReturnType<typeof useTheme> }) => {
  const [bars] = useState(() =>
    Array.from({ length: 5 }, () => new Animated.Value(0.3))
  );

  useEffect(() => {
    const animations = bars.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 1,
            duration: 300 + index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.3,
            duration: 300 + index * 100,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.stagger(100, animations).start();

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [bars]);

  return (
    <View style={styles.waveformContainer}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveformBar,
            {
              backgroundColor: theme.colors.primary,
              transform: [{ scaleY: bar }],
            },
          ]}
        />
      ))}
    </View>
  );
});

/**
 * 录音浮层组件
 */
export const VoiceRecorderModal = view(
  ({ visible, onClose, onRecordingComplete }: VoiceRecorderModalProps) => {
    const theme = useTheme();
    const { recording, duration, error, startRecording, stopRecording, reset } =
      useAudioRecorder();
    const [hasStarted, setHasStarted] = useState(false);

    // 开始录音
    useEffect(() => {
      if (visible && !hasStarted) {
        setHasStarted(true);
        // 延迟一点开始录音，确保动画流畅
        setTimeout(() => {
          startRecording().catch((err) => {
            console.error("Failed to start recording:", err);
          });
        }, 300);
      }
    }, [visible, hasStarted, startRecording]);

    // 关闭时重置状态
    useEffect(() => {
      if (!visible) {
        setHasStarted(false);
        reset();
      }
    }, [visible, reset]);

    // 处理停止录音
    const handleStopRecording = async () => {
      const uri = await stopRecording();
      if (uri) {
        onRecordingComplete(uri);
      }
      onClose();
    };

    // 处理取消录音
    const handleCancel = () => {
      reset();
      onClose();
    };

    // 格式化时长显示
    const formattedDuration = formatDuration(duration);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          {/* 背景遮罩 */}
          <Pressable style={styles.backdrop} onPress={handleCancel}>
            <View
              style={[
                styles.backdropOverlay,
                { backgroundColor: "rgba(0, 0, 0, 0.6)" },
              ]}
            />
          </Pressable>

          {/* 弹窗内容 */}
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.foreground,
              },
            ]}
          >
            {/* 关闭按钮 */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={theme.colors.foregroundSecondary} />
            </TouchableOpacity>

            {/* 标题 */}
            <Text style={[styles.title, { color: theme.colors.foreground }]}>
              {recording ? "录音中" : "准备录音"}
            </Text>

            {/* 录音状态指示器 */}
            <View style={styles.indicatorContainer}>
              {recording ? (
                <>
                  <RecordingIndicator theme={theme} />
                  <WaveformAnimation theme={theme} />
                </>
              ) : (
                <View
                  style={[
                    styles.micIconContainer,
                    { backgroundColor: theme.colors.backgroundSecondary },
                  ]}
                >
                  <Mic size={48} color={theme.colors.primary} />
                </View>
              )}
            </View>

            {/* 录音时长 */}
            <View style={styles.durationContainer}>
              <Text
                style={[styles.durationText, { color: theme.colors.foreground }]}
              >
                {formattedDuration}
              </Text>
              {recording && (
                <Text
                  style={[
                    styles.durationLabel,
                    { color: theme.colors.foregroundSecondary },
                  ]}
                >
                  正在录音...
                </Text>
              )}
            </View>

            {/* 错误提示 */}
            {error && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: theme.colors.destructive + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.errorText,
                    { color: theme.colors.destructive },
                  ]}
                >
                  {error}
                </Text>
              </View>
            )}

            {/* 操作按钮 */}
            <View style={styles.actionsContainer}>
              {/* 停止录音按钮 */}
              <TouchableOpacity
                style={[
                  styles.stopButton,
                  { backgroundColor: theme.colors.destructive },
                ]}
                onPress={handleStopRecording}
                disabled={!recording}
              >
                <Square size={28} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 提示文字 */}
            <Text
              style={[
                styles.hintText,
                { color: theme.colors.foregroundTertiary },
              ]}
            >
              点击停止按钮结束录音
            </Text>
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    flex: 1,
  },
  modalContent: {
    width: 300,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 24,
  },
  indicatorContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    marginBottom: 16,
  },
  recordingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 16,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    gap: 6,
  },
  waveformBar: {
    width: 6,
    height: 32,
    borderRadius: 3,
  },
  micIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  durationContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  durationText: {
    fontSize: 48,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
  },
  durationLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  stopButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  hintText: {
    fontSize: 13,
  },
});
