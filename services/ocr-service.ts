/**
 * OCR Service
 * 管理 OCR 识别流程的状态
 * 使用 @rabjs/react 进行响应式状态管理
 */

import { uploadAttachment } from "@/api/attachment";
import { parseImage } from "@/api/ocr";
import { handleOcrSourceSelect, OcrSourceType } from "@/components/memos/ocr-source-picker";
import { showError } from "@/utils/toast";
import { Service } from "@rabjs/react";
import * as Router from "expo-router";

/**
 * OCR 流程状态
 */
export type OcrFlowStatus =
  | "idle"
  | "uploading"
  | "recognizing"
  | "success"
  | "failed";

export default class OcrService extends Service {
  // OCR 状态
  ocrFlowStatus: OcrFlowStatus = "idle";
  ocrResultText: string | null = null;
  ocrError: string | null = null;
  ocrImageUri: string | null = null;

  /**
   * 开始 OCR 流程：从列表页按指定来源选择文件并跳转到 create 页面
   */
  async startOcrFlowFromList(
    router: Router.Router,
    source: OcrSourceType,
  ): Promise<void> {
    try {
      // 1. 根据用户选择的来源获取文件
      const file = await handleOcrSourceSelect(source);
      if (!file) {
        // 用户取消了选择
        return;
      }

      // 2. 跳转到创建页面并传入图片 URI
      const encodedImageUri = encodeURIComponent(file.uri);
      router.push(`/(memos)/create?ocrImageUri=${encodedImageUri}`);
    } catch (error) {
      console.error("OCR flow error:", error);
      showError("OCR 识别失败，请稍后重试");
    }
  }

  /**
   * 开始 OCR 流程：处理已选择的图片（create 页面内部使用）
   */
  async processSelectedImage(fileUri: string): Promise<void> {
    this.ocrFlowStatus = "uploading";
    this.ocrError = null;
    this.ocrResultText = null;
    this.ocrImageUri = fileUri;

    try {
      // 1. 上传图片
      const attachment = await uploadAttachment({
        file: { uri: fileUri, type: "image/jpeg" },
        fileName: `ocr-${Date.now()}.jpg`,
        createdAt: Date.now(),
      });

      // 2. 调用 OCR 识别
      this.ocrFlowStatus = "recognizing";
      const texts = await parseImage([attachment.url]);

      if (texts && texts.length > 0) {
        this.ocrResultText = texts.join("\n");
        this.ocrFlowStatus = "success";
      } else {
        this.ocrError = "未检测到文字";
        this.ocrFlowStatus = "failed";
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "OCR 识别失败";
      this.ocrError = errorMsg;
      this.ocrFlowStatus = "failed";
      throw err;
    }
  }

  /**
   * 重置 OCR 状态
   */
  resetOcr(): void {
    this.ocrFlowStatus = "idle";
    this.ocrResultText = null;
    this.ocrError = null;
    this.ocrImageUri = null;
  }
}
