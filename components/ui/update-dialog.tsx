/**
 * 升级提示弹窗组件
 *
 * 功能：
 * - 显示新版本信息
 * - 提供下载和安装按钮
 * - 显示下载进度
 */

import { Button } from "@/components/ui";
import { Colors } from "@/constants/theme-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import UpdateService from "@/services/update-service";
import { formatVersion } from "@/utils/version";
import { useService, view } from "@rabjs/react";
import React from "react";
import { Alert, Modal, Platform, StyleSheet, Text, View } from "react-native";

interface UpdateDialogProps {
  visible: boolean;
  onClose: () => void;
}

const UpdateDialogContent: React.FC<UpdateDialogProps> = ({
  visible,
  onClose,
}) => {
  const updateService = useService(UpdateService);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // 处理下载按钮点击
  const handleDownload = async () => {
    if (Platform.OS !== "android") {
      // 非 Android 平台，打开 GitHub Release 页面
      await updateService.openReleasePage();
      onClose();
      return;
    }

    // 开始下载
    await updateService.downloadAndInstallApk();

    // 如果下载出错，提示用户
    if (updateService.error) {
      Alert.alert("下载失败", updateService.error, [
        { text: "手动下载", onPress: updateService.openReleasePage },
        { text: "取消", style: "cancel" },
      ]);
    }
  };

  // 处理关闭
  const handleClose = () => {
    // 如果正在下载，提示用户
    if (updateService.downloading) {
      Alert.alert("正在下载", "下载正在进行中，是否取消？", [
        { text: "继续下载", style: "cancel" },
        { text: "取消下载", onPress: onClose },
      ]);
      return;
    }
    onClose();
  };

  const latestVersion = updateService.latestVersion;
  const currentVersion = updateService.currentVersion;
  const hasApk = !!updateService.getApkUrl();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* 标题 */}
          <Text style={styles.title}>发现新版本</Text>

          {/* 版本信息 */}
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>
              当前版本: {formatVersion(currentVersion)}
            </Text>
            <Text style={styles.versionText}>
              最新版本: {formatVersion(latestVersion ?? "")}
            </Text>
          </View>

          {/* Release 说明 */}
          {updateService.latestRelease?.body && (
            <View style={styles.releaseNotes}>
              <Text style={styles.releaseNotesLabel}>更新内容:</Text>
              <Text style={styles.releaseNotesText} numberOfLines={5}>
                {updateService.latestRelease.body}
              </Text>
            </View>
          )}

          {/* 下载进度 */}
          {updateService.downloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${updateService.downloadProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {updateService.downloadProgress}% 已下载
              </Text>
            </View>
          )}

          {/* 错误信息 */}
          {updateService.error && !updateService.downloading && (
            <Text style={styles.errorText}>{updateService.error}</Text>
          )}

          {/* 按钮组 */}
          <View style={styles.buttonGroup}>
            <Button
              variant="secondary"
              size="sm"
              onPress={handleClose}
              style={styles.button}
            >
              {updateService.downloading ? "取消" : "稍后再说"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={handleDownload}
              loading={updateService.downloading}
              disabled={!hasApk && Platform.OS === "android"}
              style={styles.button}
            >
              {Platform.OS === "android"
                ? hasApk
                  ? "下载并安装"
                  : "无法下载"
                : "查看详情"}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 使用 view HOC 使组件响应式
export const UpdateDialog = view(UpdateDialogContent);

UpdateDialog.displayName = "UpdateDialog";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  versionInfo: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  versionText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 18,
  },
  releaseNotes: {
    marginBottom: 12,
    maxHeight: 80,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  releaseNotesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  releaseNotesText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e8e8e8",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: "#777",
    textAlign: "center",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 10,
    lineHeight: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
