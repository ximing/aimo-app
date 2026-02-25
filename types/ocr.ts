/**
 * OCR API 类型定义
 * 图片文字识别服务接口
 */

/**
 * OCR 供应商类型
 */
export type OcrProviderType = "zhipu" | "baidu" | "ali" | "tencent";

/**
 * OCR 解析请求
 */
export interface ParseImageRequest {
  // 图片文件 URL 或 Base64 编码（单个或多个）
  files: string | string[];
  // 可选，OCR 供应商，默认使用配置中的默认供应商
  provider?: OcrProviderType;
}

/**
 * OCR 解析响应 (/parse 端点)
 */
export interface ParseImageResponse {
  texts: string[];
}

/**
 * 单个文件的 OCR 识别结果
 */
export interface OcrResult {
  index: number;
  text: string;
  originalFile: string;
  layoutDetails?: LayoutDetail[];
  layoutVisualization?: string[];
}

/**
 * OCR 布局详细信息
 */
export interface LayoutDetail {
  index: number;
  label: "image" | "text" | "formula" | "table";
  bbox2d: number[];
  content: string;
  height: number;
  width: number;
}
