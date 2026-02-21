/**
 * ASR (Automatic Speech Recognition) API 类型定义
 * 语音转文字服务接口
 */

/**
 * 转写任务状态
 */
export type TranscriptionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "RUNNING";

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
 * 转写结果中的转写内容（单个声道）
 */
export interface Transcript {
  channel_id: number;
  content_duration_in_milliseconds: number;
  text: string;
  sentences: TranscriptionSentence[];
}

/**
 * 转写结果的音频属性
 */
export interface TranscriptionProperties {
  audio_format: string;
  channels: number[];
  original_sampling_rate: number;
  original_duration_in_milliseconds: number;
}

/**
 * 单个文件的转写结果
 */
export interface TranscriptionResultItem {
  file_url: string;
  properties: TranscriptionProperties;
  transcripts: Transcript[];
}

/**
 * 转写句子
 */
export interface TranscriptionSentence {
  begin_time: number;
  end_time: number;
  text: string;
  sentence_id: number;
  words: TranscriptionWord[];
}

/**
 * 转写词
 */
export interface TranscriptionWord {
  begin_time: number;
  end_time: number;
  text: string;
  punctuation: string;
}

/**
 * 转写结果响应
 */
export interface TranscriptionResultResponse {
  status: TranscriptionStatus;
  results: TranscriptionResultItem[];
  requestId?: string;
  completedAt?: number;
  errorMessage?: string;
}
