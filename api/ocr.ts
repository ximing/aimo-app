/**
 * OCR API - 图片文字识别接口
 */

import type { OcrResult, ParseImageResponse } from "@/types/ocr";
import { apiPost } from "./common";

/**
 * 解析图片中的文字
 * POST /api/v1/ocr/parse
 * @param files - 图片文件的 HTTPS URL 数组
 * @returns Promise<OcrResult[]> - 识别结果数组
 * @throws Error 当 API 请求失败时抛出异常
 */
export const parseImage = async (files: string[]): Promise<OcrResult[]> => {
  const response = await apiPost<ParseImageResponse>("/ocr/parse", {
    files,
  });

  if (response.code !== 0) {
    throw new Error(response.msg || "OCR 识别失败");
  }

  return response.data.results;
};
