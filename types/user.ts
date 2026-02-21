/**
 * User API 类型定义
 * 对应文档: /docs/api/user.md
 */

export interface UserInfo {
  uid: string;
  email?: string;
  nickname?: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  nickname?: string;
  avatar?: string;
}

export interface UpdateUserResponse {
  message: string;
  user: UserInfo;
}

export interface UploadAvatarResponse {
  message: string;
  avatar: string;
}
