/**
 * Tag API 类型定义
 * 对应文档: /docs/api/tag.md
 */

export interface TagDto {
  tagId: string;
  uid: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  name?: string;
}

export interface TagsListResponse {
  message: string;
  tags: TagDto[];
}

export interface TagResponse {
  message: string;
  tag: TagDto;
}
