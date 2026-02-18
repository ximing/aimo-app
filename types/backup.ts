/**
 * Backup API 类型定义
 * 对应文档: /docs/api/backup.md
 */

/**
 * 备份状态数据传输对象
 */
export interface BackupStatus {
  enabled: boolean;           // 备份是否启用
  inProgress: boolean;       // 备份是否正在进行
  lastBackupTime: number;    // 上次备份时间戳（毫秒）
  throttleInterval: number;   // 备份节流间隔（毫秒）
}

export interface BackupStatusResponse {
  backup: BackupStatus;
}

export interface BackupMessageResponse {
  message: string;
}
