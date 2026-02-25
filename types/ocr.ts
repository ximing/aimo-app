/**
 * OCR API 类型定义
 * 图片文字识别服务接口
 */

/**
 * OCR 解析请求
 */
export interface ParseImageRequest {
  files: string[];
}

/**
 * OCR 解析响应
 */
export interface ParseImageResponse {
  results: OcrResult[];
}

/**
 * 单个文件的 OCR 识别结果
 */
export interface OcrResult {
  fileUrl: string;
  texts: string[];
  success: boolean;
  errorMessage?: string;
}
