/**
 * ASR (Automatic Speech Recognition) API 类型定义
 * 语音转文字服务接口
 */

/**
 * 转写任务状态
 */
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * 提交转写任务请求
 */
export interface SubmitTranscriptionRequest {
  fileUrls: string[];
  languageHints?: string[];
}

/**
 * 转写任务响应
 */
export interface SubmitTranscriptionResponse {
  taskId: string;
  status: TranscriptionStatus;
  message?: string;
}

/**
 * 转写任务状态响应
 */
export interface TranscriptionTaskStatusResponse {
  taskId: string;
  status: TranscriptionStatus;
  progress?: number;
  message?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 转写结果片段
 */
export interface TranscriptionSegment {
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

/**
 * 单个文件的转写结果
 */
export interface TranscriptionResultItem {
  fileUrl: string;
  text: string;
  confidence: number;
  segments: TranscriptionSegment[];
}

/**
 * 转写结果响应
 */
export interface TranscriptionResultResponse {
  taskId: string;
  status: TranscriptionStatus;
  transcripts: TranscriptionResultItem[];
  completedAt?: number;
  errorMessage?: string;
}
