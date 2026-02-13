/**
 * Attachment API 类型定义
 * 对应文档: /docs/api/attachment.md
 */

import type { PaginatedResponse } from '@/types/common';

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uid: string;
  url?: string;
  createdAt: number;
  updatedAt: number;
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
