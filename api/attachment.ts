/**
 * Attachment API - 附件相关接口
 * 文档: /docs/api/attachment.md
 */

import { apiGet, apiPost, apiDelete, createFormData } from './common';
import type {
  Attachment,
  UploadAttachmentRequest,
  ListAttachmentsParams,
  AttachmentsListResponse,
  UploadResponse,
  AttachmentResponse,
} from '@/types/attachment';

/**
 * 获取附件列表
 * GET /api/v1/attachments
 */
export const getAttachments = async (
  params?: ListAttachmentsParams
): Promise<AttachmentsListResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));

  const queryString = queryParams.toString();
  const url = queryString ? `/attachments?${queryString}` : '/attachments';

  const response = await apiGet<AttachmentsListResponse>(url);

  if (response.code !== 0) {
    throw new Error(response.message || '获取附件列表失败');
  }

  return response.data;
};

/**
 * 获取单个附件信息
 * GET /api/v1/attachments/:attachmentId
 */
export const getAttachment = async (attachmentId: string): Promise<Attachment> => {
  const response = await apiGet<Attachment>(`/attachments/${attachmentId}`);

  if (response.code !== 0) {
    throw new Error(response.message || '获取附件信息失败');
  }

  return response.data;
};

/**
 * 上传附件
 * POST /api/v1/attachments/upload
 */
export const uploadAttachment = async (
  params: UploadAttachmentRequest
): Promise<Attachment> => {
  const { file, fileName, createdAt } = params;

  const additionalFields: Record<string, string | number> = {};
  if (createdAt !== undefined) {
    additionalFields.createdAt = createdAt;
  }

  const formData = createFormData(file, fileName, additionalFields);

  const response = await apiPost<UploadResponse>(
    '/attachments/upload',
    formData,
    true // isFormData = true
  );

  if (response.code !== 0) {
    throw new Error(response.message || '上传附件失败');
  }

  return response.data.attachment;
};

/**
 * 删除附件
 * DELETE /api/v1/attachments/:attachmentId
 */
export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  const response = await apiDelete<AttachmentResponse>(`/attachments/${attachmentId}`);

  if (response.code !== 0) {
    throw new Error(response.message || '删除附件失败');
  }
};

/**
 * 获取附件的下载 URL
 */
export const getAttachmentUrl = (attachmentId: string): string => {
  return `https://memo.aisoil.fun/api/v1/attachments/file/${attachmentId}`;
};
