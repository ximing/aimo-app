/**
 * User API 类型定义
 * 对应文档: /docs/api/user.md
 */

export interface UserInfo {
  uid: string;
  email: string;
  nickname?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  nickname?: string;
  phone?: string;
}

export interface UpdateUserResponse {
  message: string;
  user: UserInfo;
}
