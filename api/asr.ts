/**
 * ASR API - 语音转文字相关接口
 * 文档: /docs/api/asr.md
 */

import { apiGet, apiPost } from './common';
import type {
  SubmitTranscriptionRequest,
  SubmitTranscriptionResponse,
  TranscriptionTaskStatusResponse,
  TranscriptionResultResponse,
} from '@/types/asr';

/**
 * 提交语音转写任务
 * POST /api/v1/asr/transcribe
 *
 * @param fileUrls - 音频文件 URL 数组
 * @param languageHints - 语言提示（如 ["zh", "en"]）
 * @returns 转写任务信息
 */
export const submitTranscriptionTask = async (
  fileUrls: string[],
  languageHints: string[] = ['zh', 'en']
): Promise<SubmitTranscriptionResponse> => {
  const request: SubmitTranscriptionRequest = {
    fileUrls,
    languageHints,
  };

  const response = await apiPost<SubmitTranscriptionResponse>('/asr/transcribe', request);

  if (response.code !== 0) {
    throw new Error(response.message || '提交转写任务失败');
  }

  return response.data;
};

/**
 * 获取转写任务状态
 * GET /api/v1/asr/task/:taskId
 *
 * @param taskId - 任务 ID
 * @returns 任务状态信息
 */
export const getTaskStatus = async (
  taskId: string
): Promise<TranscriptionTaskStatusResponse> => {
  const response = await apiGet<TranscriptionTaskStatusResponse>(`/asr/task/${taskId}`);

  if (response.code !== 0) {
    throw new Error(response.message || '获取任务状态失败');
  }

  return response.data;
};

/**
 * 获取转写结果
 * GET /api/v1/asr/result/:taskId
 *
 * @param taskId - 任务 ID
 * @returns 转写结果
 */
export const getTranscriptionResult = async (
  taskId: string
): Promise<TranscriptionResultResponse> => {
  const response = await apiGet<TranscriptionResultResponse>(`/asr/result/${taskId}`);

  if (response.code !== 0) {
    throw new Error(response.message || '获取转写结果失败');
  }

  return response.data;
};
