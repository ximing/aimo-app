/**
 * Attachment API 类型定义
 * 对应文档: /docs/api/attachment.md
 */

import type { PaginatedResponse } from '@/types/common';

/**
 * 附件数据传输对象
 */
export interface Attachment {
  attachmentId: string;  // 附件唯一标识符
  filename: string;      // 文件名
  url: string;          // 访问 URL
  type: string;         // MIME 类型
  size: number;         // 文件大小（字节）
  createdAt: number;    // 创建时间戳（毫秒）
}

export interface UploadAttachmentRequest {
  file: File | Blob | { uri: string; type?: string };
  fileName: string;
  createdAt?: number;
}

export interface ListAttachmentsParams {
  page?: number;
  limit?: number;
}

export interface AttachmentsListResponse extends PaginatedResponse<Attachment> {}

export interface UploadResponse {
  message: string;
  attachment: Attachment;
}

export interface AttachmentResponse {
  id?: string;
  message?: string;
  attachment?: Attachment;
}
