/**
 * Toast Component - 简单的 Toast 提示组件
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { registerToastCallback } from "@/utils/toast";

export const Toast = () => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 注册全局 Toast 回调
  useEffect(() => {
    const showToastMessage = (msg: string, duration: number = 2000) => {
      setMessage(msg);
      setVisible(true);

      // 显示动画
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 清除之前的计时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 设置隐藏计时器
      timeoutRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          setMessage("");
        });
      }, duration);
    };

    registerToastCallback(showToastMessage);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fadeAnim]);

  if (!visible) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: fadeAnim,
            backgroundColor: theme.colors.foreground,
          },
        ]}
      >
        <Text
          style={[
            styles.toastText,
            { color: theme.colors.background },
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

Toast.displayName = "Toast";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none",
    paddingBottom: 40,
  },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
