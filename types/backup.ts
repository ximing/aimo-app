/**
 * Backup API 类型定义
 * 对应文档: /docs/api/backup.md
 */

export interface BackupStatus {
  lastBackupTime: number;
  lastBackupStatus: 'success' | 'failed';
  backupCount: number;
  nextScheduledBackup: number;
  isRunning: boolean;
  backupPath: string;
  retentionDays: number;
}

export interface BackupStatusResponse {
  backup: BackupStatus;
}

export interface BackupMessageResponse {
  message: string;
}
