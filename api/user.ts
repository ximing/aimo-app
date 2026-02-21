/**
 * User API - 用户相关接口
 * 文档: /docs/api/user.md
 */

import { apiGet, apiPost, apiPut, createFormData } from './common';
import type { UserInfo, UpdateUserRequest, UpdateUserResponse, UploadAvatarResponse } from '@/types/user';

/**
 * 获取当前用户信息
 * GET /api/v1/user/info
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await apiGet<UserInfo>('/user/info');

  if (response.code !== 0) {
    throw new Error(response.message || '获取用户信息失败');
  }

  return response.data;
};

/**
 * 更新用户信息
 * PUT /api/v1/user/info
 */
export const updateUserInfo = async (
  params: UpdateUserRequest
): Promise<UserInfo> => {
  const response = await apiPut<UpdateUserResponse>('/user/info', params);

  if (response.code !== 0) {
    throw new Error(response.message || '更新用户信息失败');
  }

  return response.data.user;
};

/**
 * 上传用户头像
 * POST /api/v1/user/avatar
 *
 * @param avatar - 图片文件：Web File 或 React Native { uri, type, name } 对象
 */
export const uploadAvatar = async (
  avatar: File | { uri: string; type?: string; name?: string }
): Promise<string> => {
  const formData = createFormData(avatar, 'avatar.jpg');
  const response = await apiPost<UploadAvatarResponse>('/user/avatar', formData, true);

  if (response.code !== 0) {
    throw new Error(response.message || '上传头像失败');
  }

  return response.data.avatar;
};
