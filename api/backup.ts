/**
 * Backup API - 备份相关接口
 * 文档: /docs/api/backup.md
 */

import { apiGet, apiPost } from './common';
import type { BackupStatus, BackupStatusResponse, BackupMessageResponse } from '@/types/backup';

/**
 * 获取备份状态
 * GET /api/v1/backup/status
 */
export const getBackupStatus = async (): Promise<BackupStatus> => {
  const response = await apiGet<BackupStatusResponse>('/backup/status');

  if (response.code !== 0) {
    throw new Error(response.message || '获取备份状态失败');
  }

  return response.data.backup;
};

/**
 * 立即备份
 * POST /api/v1/backup/force
 */
export const forceBackup = async (): Promise<void> => {
  const response = await apiPost<BackupMessageResponse>('/backup/force', {});

  if (response.code !== 0) {
    throw new Error(response.message || '备份启动失败');
  }
};

/**
 * 清理过期备份
 * POST /api/v1/backup/cleanup
 */
export const cleanupBackups = async (): Promise<void> => {
  const response = await apiPost<BackupMessageResponse>('/backup/cleanup', {});

  if (response.code !== 0) {
    throw new Error(response.message || '清理备份失败');
  }
};
