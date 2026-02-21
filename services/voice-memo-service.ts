/**
 * Voice Memo Service
 * 管理录音转文字的整个流程状态
 * 使用 @rabjs/react 进行响应式状态管理
 */

import {
  getTaskStatus,
  getTranscriptionResult,
  submitTranscriptionTask,
} from "@/api/asr";
import { getAttachment, uploadAttachment } from "@/api/attachment";
import type { TranscriptionStatus } from "@/types/asr";
import { Service } from "@rabjs/react";

/**
 * 音频录制状态
 */
export type RecordingStatus = "idle" | "recording" | "stopped" | "error";

/**
 * 转写流程状态
 */
export type TranscriptionFlowStatus =
  | "idle"
  | "uploading"
  | "submitting"
  | "polling"
  | "success"
  | "failed";

class VoiceMemoService extends Service {
  // 录音状态
  recordingStatus: RecordingStatus = "idle";
  audioUri: string | null = null;
  recordingDuration = 0;
  recordingError: string | null = null;

  // 转写状态
  transcriptionFlowStatus: TranscriptionFlowStatus = "idle";
  transcriptionTaskId: string | null = null;
  transcriptionText: string | null = null;
  transcriptionStatus: TranscriptionStatus | null = null;
  transcriptionError: string | null = null;
  attachmentId: string | null = null;
  attachmentUrl: string | null = null;

  // 轮询控制
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private pollingCount = 0;
  private readonly MAX_POLLING_COUNT = 30; // 最多轮询30次
  private readonly POLLING_INTERVAL = 2000; // 每2秒轮询一次

  /**
   * 开始录音
   */
  startRecording(): void {
    this.recordingStatus = "recording";
    this.recordingDuration = 0;
    this.recordingError = null;
    this.audioUri = null;
  }

  /**
   * 更新录音时长
   */
  updateRecordingDuration(duration: number): void {
    this.recordingDuration = duration;
  }

  /**
   * 停止录音
   */
  stopRecording(audioUri: string): void {
    this.recordingStatus = "stopped";
    this.audioUri = audioUri;
  }

  /**
   * 录音错误
   */
  setRecordingError(error: string): void {
    this.recordingStatus = "error";
    this.recordingError = error;
  }

  /**
   * 重置录音状态
   */
  resetRecording(): void {
    this.recordingStatus = "idle";
    this.audioUri = null;
    this.recordingDuration = 0;
    this.recordingError = null;
  }

  /**
   * 上传音频并提交转写任务
   * 整合流程：上传 -> 获取URL -> 提交ASR任务
   */
  async uploadAndTranscribe(audioUri: string): Promise<void> {
    this.transcriptionFlowStatus = "uploading";
    this.transcriptionError = null;
    this.transcriptionText = null;
    this.transcriptionTaskId = null;

    try {
      // 1. 上传音频文件
      const fileName = `voice-memo-${Date.now()}.m4a`;
      const attachment = await uploadAttachment({
        file: { uri: audioUri, type: "audio/m4a" },
        fileName,
        createdAt: Date.now(),
      });

      this.attachmentId = attachment.attachmentId;

      // 2. 获取附件详情以获取 URL
      const attachmentDetail = await getAttachment(attachment.attachmentId);
      this.attachmentUrl = attachmentDetail.url;

      // 3. 提交转写任务
      this.transcriptionFlowStatus = "submitting";
      const taskResponse = await submitTranscriptionTask(
        [attachmentDetail.url],
        ["zh", "en"],
      );

      this.transcriptionTaskId = taskResponse.taskId;
      this.transcriptionStatus = taskResponse.status;

      // 4. 开始轮询任务状态
      this.startPolling(taskResponse.taskId);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "上传或提交转写任务失败";
      this.transcriptionError = errorMsg;
      this.transcriptionFlowStatus = "failed";
      throw err;
    }
  }

  /**
   * 提交转写任务（音频已上传时）
   */
  async submitTranscription(fileUrl: string): Promise<void> {
    this.transcriptionFlowStatus = "submitting";
    this.transcriptionError = null;

    try {
      const response = await submitTranscriptionTask([fileUrl], ["zh", "en"]);
      this.transcriptionTaskId = response.taskId;
      this.transcriptionStatus = response.status;

      // 开始轮询
      this.startPolling(response.taskId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "提交转写任务失败";
      this.transcriptionError = errorMsg;
      this.transcriptionFlowStatus = "failed";
      throw err;
    }
  }

  /**
   * 开始轮询任务状态
   */
  private startPolling(taskId: string): void {
    this.transcriptionFlowStatus = "polling";
    this.pollingCount = 0;

    // 清除已有的轮询
    this.stopPolling();

    // 立即执行一次
    this.pollTaskStatus(taskId);

    // 设置定时轮询
    this.pollingInterval = setInterval(() => {
      this.pollTaskStatus(taskId);
    }, this.POLLING_INTERVAL);
  }

  /**
   * 轮询任务状态
   */
  private async pollTaskStatus(taskId: string): Promise<void> {
    try {
      this.pollingCount++;

      // 检查是否超过最大轮询次数
      if (this.pollingCount > this.MAX_POLLING_COUNT) {
        this.stopPolling();
        this.transcriptionFlowStatus = "failed";
        this.transcriptionError = "转写任务超时，请稍后重试";
        return;
      }

      // 获取任务状态
      const statusResponse = await getTaskStatus(taskId);
      this.transcriptionStatus = statusResponse.status;

      // 根据状态处理
      if (statusResponse.status === "SUCCEEDED") {
        // 任务完成，获取结果
        await this.fetchTranscriptionResult(taskId);
      } else if (statusResponse.status === "FAILED") {
        // 任务失败
        this.stopPolling();
        this.transcriptionFlowStatus = "failed";
        this.transcriptionError = statusResponse.message || "转写任务失败";
      }
      // PENDING 或 PROCESSING 状态继续轮询
    } catch (err) {
      // 轮询错误，继续尝试
      console.error("Polling error:", err);
    }
  }

  /**
   * 获取转写结果
   */
  private async fetchTranscriptionResult(taskId: string): Promise<void> {
    try {
      const result = await getTranscriptionResult(taskId);

      if (result.status === "SUCCEEDED" && result.results.length > 0) {
        this.transcriptionText = result.results.reduce((acc, item) => {
          return `${acc}${item.transcripts.reduce((acc, item) => {
            return `${acc}${item.text}`;
          }, "")}`;
        }, "");
        this.transcriptionFlowStatus = "success";
      } else if (result.status === "FAILED") {
        this.transcriptionFlowStatus = "failed";
        this.transcriptionError = result.errorMessage || "转写失败";
      }
    } catch (err) {
      this.transcriptionFlowStatus = "failed";
      this.transcriptionError =
        err instanceof Error ? err.message : "获取转写结果失败";
    } finally {
      this.stopPolling();
    }
  }

  /**
   * 停止轮询
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * 手动轮询任务状态（外部调用）
   */
  async pollTranscriptionStatus(taskId: string): Promise<void> {
    await this.pollTaskStatus(taskId);
  }

  /**
   * 重置转写状态
   */
  resetTranscription(): void {
    this.stopPolling();
    this.transcriptionFlowStatus = "idle";
    this.transcriptionTaskId = null;
    this.transcriptionText = null;
    this.transcriptionStatus = null;
    this.transcriptionError = null;
    this.attachmentId = null;
    this.attachmentUrl = null;
    this.pollingCount = 0;
  }

  /**
   * 重置所有状态
   */
  resetAll(): void {
    this.resetRecording();
    this.resetTranscription();
  }

  /**
   * 清除转写错误
   */
  clearTranscriptionError(): void {
    this.transcriptionError = null;
    if (this.transcriptionFlowStatus === "failed") {
      this.transcriptionFlowStatus = "idle";
    }
  }
}

export default VoiceMemoService;
