/**
 * Attachment API - 附件相关接口
 * 文档: /docs/api/attachment.md
 */

import type {
  Attachment,
  AttachmentResponse,
  AttachmentsListResponse,
  ListAttachmentsParams,
  UploadAttachmentRequest,
  UploadResponse,
} from "@/types/attachment";
import {
  apiDelete,
  apiGet,
  apiPost,
  BASE_URL,
  createFormData,
  getToken,
} from "./common";
// expo-file-system legacy API
import {
  FileSystemUploadType,
  uploadAsync,
} from "expo-file-system/legacy";

/**
 * 获取附件列表
 * GET /api/v1/attachments
 */
export const getAttachments = async (
  params?: ListAttachmentsParams,
): Promise<AttachmentsListResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const queryString = queryParams.toString();
  const url = queryString ? `/attachments?${queryString}` : "/attachments";

  const response = await apiGet<AttachmentsListResponse>(url);

  if (response.code !== 0) {
    throw new Error(response.message || "获取附件列表失败");
  }

  return response.data;
};

/**
 * 获取单个附件信息
 * GET /api/v1/attachments/:attachmentId
 */
export const getAttachment = async (
  attachmentId: string,
): Promise<Attachment> => {
  const response = await apiGet<Attachment>(`/attachments/${attachmentId}`);

  if (response.code !== 0) {
    throw new Error(response.message || "获取附件信息失败");
  }

  return response.data;
};

/**
 * 上传附件
 * POST /api/v1/attachments/upload
 *
 * 使用 multipart/form-data 表单方式上传文件
 * - 支持 Web File/Blob 和 React Native URI 对象
 * - 自动处理 FormData 的构建
 *
 * @param params 上传参数
 *   - file: 文件对象（Web File/Blob 或 RN { uri, type }）
 *   - fileName: 文件名称
 *   - createdAt: 可选的创建时间戳（毫秒）
 * @returns 返回上传成功后的附件对象
 */
export const uploadAttachment = async (
  params: UploadAttachmentRequest,
): Promise<Attachment> => {
  const { file, fileName, createdAt } = params;

  // 检测是否是 React Native 环境（通过是否存在 uri 属性判断）
  const isReactNative = typeof file === "object" && "uri" in file;

  if (isReactNative) {
    // React Native 环境：使用 XMLHttpRequest 上传
    return await uploadWithXHR(
      file.uri,
      fileName,
      file.type || "application/octet-stream",
      createdAt,
    );
  }

  // Web 环境：使用原来的 FormData 方式
  const additionalFields: Record<string, string | number> = {};
  if (createdAt !== undefined) {
    additionalFields.createdAt = createdAt;
  }

  const formData = createFormData(file, fileName, additionalFields);

  const response = await apiPost<UploadResponse>(
    "/attachments/upload",
    formData,
    true,
  );

  if (response.code !== 0) {
    throw new Error(response.message || "上传附件失败");
  }

  return response.data.attachment;
};

/**
 * 使用 expo-file-system uploadAsync 上传文件（React Native）
 * 这个方法专门用于处理本地文件 URI
 */
const uploadWithXHR = async (
  uri: string,
  fileName: string,
  mimeType: string,
  createdAt?: number,
): Promise<Attachment> => {
  const token = getToken();
  const uploadUrl = `${BASE_URL}/attachments/upload`;

  try {
    // 使用 expo-file-system 的 uploadAsync
    const result = await uploadAsync(uploadUrl, uri, {
      fieldName: "file",
      mimeType: mimeType,
      httpMethod: "POST",
      uploadType: FileSystemUploadType.MULTIPART,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      parameters: createdAt ? { createdAt: String(createdAt) } : {},
    });

    if (result.status >= 200 && result.status < 300) {
      const response =
        typeof result.body === "string" ? JSON.parse(result.body) : result.body;

      if (response.code !== 0) {
        throw new Error(response.message || "上传附件失败");
      }

      return response.data.attachment;
    } else {
      throw new Error(`上传失败: ${result.status} - ${result.body}`);
    }
  } catch (error) {
    console.error("uploadWithFileSystem - error:", error);
    throw error;
  }
};

/**
 * 删除附件
 * DELETE /api/v1/attachments/:attachmentId
 */
export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  const response = await apiDelete<AttachmentResponse>(
    `/attachments/${attachmentId}`,
  );

  if (response.code !== 0) {
    throw new Error(response.message || "删除附件失败");
  }
};

/**
 * 下载附件到本地
 * 支持 React Native 下载并保存到本地文件系统
 * GET /api/v1/attachments/:attachmentId/download
 *
 * @param attachmentId 附件 ID
 * @param onProgress 下载进度回调（loaded, total, percent）
 * @returns 返回下载后的本地文件路径（React Native 环境）或 blob URL（Web 环境）
 */
export const downloadAttachment = async (
  attachmentId: string,
  onProgress?: (progress: {
    loaded: number;
    total: number;
    percent: number;
  }) => void,
): Promise<string> => {
  try {
    // 首先获取附件信息（需要知道文件名）
    const attachment = await getAttachment(attachmentId);

    const response = await fetch(
      `${BASE_URL}/attachments/${attachmentId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken() || ""}`,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    // 处理进度
    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to read response body");
    }

    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (onProgress && total > 0) {
        onProgress({
          loaded,
          total,
          percent: Math.round((loaded / total) * 100),
        });
      }
    }

    // 合并数据块
    const blob = new Blob(chunks);

    // 检查是否在 React Native 环境
    if (typeof document === "undefined") {
      // React Native 环境 - 需要额外的库支持本地文件保存
      // 这里返回 blob 的占位符，实际使用需要集成 RNFS 库
      console.warn(
        "Direct blob saving not supported in RN. Use RNFS library for file saving.",
      );
      return `blob:${attachment.attachmentId}`;
    } else {
      // Web 环境 - 创建下载链接
      const url = URL.createObjectURL(blob);

      // 自动触发下载
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.filename || `attachment_${attachmentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理
      URL.revokeObjectURL(url);

      return url;
    }
  } catch (error) {
    console.error("Download attachment error:", error);
    throw error;
  }
};

/**
 * 获取附件的下载 URL（直接链接）
 */
export const getAttachmentUrl = (attachmentId: string): string => {
  return `${BASE_URL}/attachments/${attachmentId}/download`;
};

/**
 * 删除本地文件
 * @param uri - 文件 URI
 */
export const deleteLocalFile = async (uri: string): Promise<void> => {
  try {
    const { deleteAsync } = await import('expo-file-system/legacy');
    await deleteAsync(uri);
    console.log('Local file deleted:', uri);
  } catch (error) {
    console.warn('Failed to delete local file:', error);
    // 不抛出错误，只是警告
  }
};
