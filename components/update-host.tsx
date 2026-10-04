/**
 * 强制更新遮罩。普通更新只在下载完成后用 Toast 提示安装。
 */

import { Button } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { formatProgress, progressRatio } from "@/lib/app-update";
import AppUpdateService from "@/services/app-update.service";
import { useService, view } from "@rabjs/react";
import React from "react";
import { Linking, Modal, StyleSheet, Text, View } from "react-native";

const UpdateHostContent = () => {
  const theme = useTheme();
  const update = useService(AppUpdateService);
  const forced = update.forced;
  const remote = update.remote;
  const phase = update.phase;
  const bytes = update.bytesDownloaded;
  const total = update.totalBytes;
  const pendingPermission = update.pendingPermission;
  const supported = update.supported;

  if (!forced || !remote) return null;

  const ratio = progressRatio(bytes, total);
  const pct = formatProgress(bytes, total);
  const canInstall = phase === "ready";
  const downloading = phase === "downloading" || phase === "checking";

  return (
    <Modal visible animationType="fade">
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>
          需要更新后才能继续使用
        </Text>
        <Text style={[styles.body, { color: theme.colors.foregroundSecondary }]}>
          请安装 AIMO {remote.versionName}。下载在后台进行，完成后点安装。
        </Text>
        {remote.releaseNotes ? (
          <Text style={[styles.notes, { color: theme.colors.foreground }]} numberOfLines={6}>
            {remote.releaseNotes}
          </Text>
        ) : null}
        {downloading ? (
          <View style={styles.progressBlock}>
            <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.round(ratio * 100)}%`, backgroundColor: theme.colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.meta, { color: theme.colors.foregroundSecondary }]}>
              {pct || "下载中"}
            </Text>
          </View>
        ) : null}
        {phase === "failed" ? (
          <Text style={[styles.meta, { color: theme.colors.destructive }]}>更新失败</Text>
        ) : null}
        {pendingPermission ? (
          <Text style={[styles.meta, { color: theme.colors.foregroundSecondary }]}>
            请允许安装未知应用后再试。
          </Text>
        ) : null}
        <View style={styles.actions}>
          {supported ? (
            <Button
              variant="primary"
              loading={phase === "installing"}
              disabled={!canInstall && phase !== "failed" && !pendingPermission}
              onPress={() => void (phase === "failed" ? update.check({ user: true }) : update.install())}
            >
              {phase === "failed" ? "重试" : pendingPermission ? "去授权" : "安装"}
            </Button>
          ) : (
            <Button variant="primary" onPress={() => void Linking.openURL(remote.apkUrl)}>
              安装
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const UpdateHost = view(UpdateHostContent);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: "center",
    gap: 16,
  },
  title: { fontSize: 22, lineHeight: 30, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 24 },
  notes: { fontSize: 14, lineHeight: 20 },
  progressBlock: { gap: 8 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  meta: { fontSize: 13 },
  actions: { marginTop: 8 },
});
