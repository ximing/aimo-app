/**
 * OCR API - 图片文字识别接口
 */

import type { OcrProviderType, ParseImageResponse } from "@/types/ocr";
import { apiPost } from "./common";

/**
 * 解析图片中的文字
 * POST /api/v1/ocr/parse
 * @param files - 图片文件的 HTTPS URL 或 Base64（单个或多个）
 * @param provider - 可选的 OCR 供应商
 * @returns Promise<string[]> - 识别出的文本数组
 * @throws Error 当 API 请求失败时抛出异常
 */
export const parseImage = async (
  files: string | string[],
  provider?: OcrProviderType,
): Promise<string[]> => {
  const response = await apiPost<ParseImageResponse>("/ocr/parse", {
    files,
    ...(provider && { provider }),
  });

  if (response.code !== 0) {
    throw new Error(response.msg || "OCR 识别失败");
  }

  return response.data.texts;
};
